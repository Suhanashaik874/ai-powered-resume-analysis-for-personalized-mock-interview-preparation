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

      const evalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: 'You are an expert interviewer. Evaluate the answer and return ONLY valid JSON.',
          }, {
            role: 'user',
            content: `Question: ${q.question_text}\nExpected: ${q.expected_answer || 'N/A'}\nUser Answer: ${userResponse}\n\nReturn JSON: {"score": 0-10, "is_correct": true/false, "feedback": "detailed markdown feedback with strengths and improvements", "optimal_solution": "if coding, provide optimal solution"}`,
          }],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (!evalResponse.ok) {
        console.error('AI eval error:', evalResponse.status);
        evaluations.push({ id: q.id, score: 0 });
        continue;
      }

      const evalData = await evalResponse.json();
      const content = evalData.choices?.[0]?.message?.content || '{}';
      
      let result = { score: 0, is_correct: false, feedback: '', optimal_solution: '' };
      try {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(cleaned);
      } catch { /* use defaults */ }

      totalScore += result.score || 0;
      const feedback = result.feedback + (result.optimal_solution ? `\n\n**Optimal Solution:**\n\`\`\`\n${result.optimal_solution}\n\`\`\`` : '');

      await supabase.from('interview_questions').update({
        score: result.score || 0,
        is_correct: result.is_correct || false,
        ai_feedback: feedback,
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
          content: `Score: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%). Write 3-4 sentences of overall interview feedback with key strengths and top 2 improvement areas. Use markdown.`,
        }],
        max_tokens: 300,
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
