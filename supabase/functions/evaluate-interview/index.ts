import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { interviewId } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: questions } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId);

    if (!questions?.length) throw new Error('No questions found');

    const evaluations = [];
    let totalScore = 0;
    const maxScore = questions.length * 10;

    for (const q of questions) {
      const userResponse = q.user_code || q.user_answer || '';
      if (!userResponse.trim()) {
        await supabase.from('interview_questions').update({
          score: 0, is_correct: false, ai_feedback: 'No answer provided.',
        }).eq('id', q.id);
        evaluations.push({ id: q.id, score: 0 });
        continue;
      }

      // Build evaluation prompt based on question type
      let evalPrompt = '';
      if (q.question_type === 'coding') {
        evalPrompt = `You are an expert coding interviewer. Evaluate this coding answer thoroughly.

Question: ${q.question_text}
Expected Approach: ${q.expected_answer || 'N/A'}
User's Code: ${userResponse}

Return JSON with these fields:
{
  "score": 0-10,
  "is_correct": true/false,
  "feedback": "Detailed markdown feedback including:\n- **Correctness**: Does the solution work for all test cases?\n- **Time Complexity**: What is the time complexity of the user's solution?\n- **Space Complexity**: What is the space complexity?\n- **Strengths**: What did the user do well?\n- **Areas to Improve**: What could be better?\n- **Edge Cases**: Any missed edge cases?",
  "optimal_solution": "The most optimal solution code with O(n)/O(1) complexity explanation. Include the code and explain why it's optimal.",
  "correct_answer": "Brief description of the correct approach"
}`;
      } else if (q.question_type === 'aptitude') {
        evalPrompt = `You are evaluating an aptitude test answer.

Question: ${q.question_text}
Correct Answer: ${q.expected_answer || 'N/A'}
User's Answer: ${userResponse}

Return JSON:
{
  "score": 0 or 10 (0 if wrong, 10 if correct),
  "is_correct": true/false,
  "feedback": "Explanation of why the answer is correct/incorrect. Show the step-by-step solution.",
  "correct_answer": "The correct answer with full explanation"
}`;
      } else {
        // HR questions
        evalPrompt = `You are an expert HR interviewer evaluating a behavioral interview answer.

Question: ${q.question_text}
Key Points Expected: ${q.expected_answer || 'N/A'}
User's Answer: ${userResponse}

Return JSON:
{
  "score": 0-10,
  "is_correct": true/false (true if score >= 6),
  "feedback": "Detailed markdown feedback including:\n- **Communication**: How well did they articulate?\n- **STAR Method**: Did they use Situation, Task, Action, Result?\n- **Strengths**: What was good about the answer?\n- **What to Improve**: Specific suggestions for a better answer\n- **Missing Points**: Key points they should have covered",
  "correct_answer": "An ideal answer that covers all key points"
}`;
      }

      const evalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: 'You are an expert interviewer. Evaluate the answer and return ONLY valid JSON. No markdown fences.',
          }, {
            role: 'user',
            content: evalPrompt,
          }],
          temperature: 0.3,
          max_tokens: 1200,
        }),
      });

      if (!evalResponse.ok) {
        console.error('AI eval error:', evalResponse.status);
        evaluations.push({ id: q.id, score: 0 });
        continue;
      }

      const evalData = await evalResponse.json();
      const content = evalData.choices?.[0]?.message?.content || '{}';
      
      let result = { score: 0, is_correct: false, feedback: '', optimal_solution: '', correct_answer: '' };
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(cleaned);
      } catch { /* use defaults */ }

      totalScore += result.score || 0;
      
      // Build comprehensive feedback
      let feedback = result.feedback || '';
      if (result.correct_answer) {
        feedback += `\n\n**✅ Correct/Ideal Answer:**\n${result.correct_answer}`;
      }
      if (result.optimal_solution) {
        feedback += `\n\n**🚀 Optimal Solution:**\n\`\`\`\n${result.optimal_solution}\n\`\`\``;
      }

      await supabase.from('interview_questions').update({
        score: result.score || 0,
        is_correct: result.is_correct || false,
        ai_feedback: feedback,
        expected_answer: result.correct_answer || q.expected_answer || null,
      }).eq('id', q.id);

      evaluations.push({ id: q.id, score: result.score });
    }

    // Overall feedback
    const overallResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Interview score: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%).

Write a comprehensive interview feedback in markdown with:
1. **Overall Performance** - 2-3 sentence summary
2. **Key Strengths** - Top 3 things done well
3. **Areas for Improvement** - Top 3 things to work on with specific action items
4. **Recommendations** - Resources or topics to study`,
        }],
        max_tokens: 500,
      }),
    });
    const overallData = await overallResp.json();
    const overallFeedback = overallData.choices?.[0]?.message?.content || '';

    await supabase.from('interviews').update({
      total_score: totalScore,
      max_score: maxScore,
      feedback: overallFeedback,
    }).eq('id', interviewId);

    return new Response(JSON.stringify({ totalScore, maxScore, evaluations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('evaluate-interview error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
