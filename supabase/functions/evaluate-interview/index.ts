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

    // Fetch interview record for solution_language and user_id
    const { data: interview } = await supabase
      .from('interviews')
      .select('solution_language, user_id, interview_type')
      .eq('id', interviewId)
      .single();

    const solutionLanguage = interview?.solution_language || 'python';
    const userId = interview?.user_id;
    const langInstruction = `IMPORTANT: All code solutions, examples, and code snippets MUST be written in ${solutionLanguage.toUpperCase()}. Do not use any other programming language.`;

    // Fetch user's extracted skills for skill gap analysis
    let extractedSkills: { skill_name: string; proficiency_level: string }[] = [];
    if (userId) {
      const { data: skills } = await supabase
        .from('extracted_skills')
        .select('skill_name, proficiency_level')
        .eq('user_id', userId);
      extractedSkills = skills || [];
    }

    const evaluations = [];
    let totalScore = 0;
    const maxScore = questions.length * 10;

    for (const q of questions) {
      const userResponse = q.user_code || q.user_answer || '';
      // Detect empty or default template answers
      const stripped = userResponse.replace(/\/\/.*|#.*|\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
      const templatePatterns = [
        /^(def\s+solution\s*\(\s*\)\s*:\s*pass\s*(solution\s*\(\s*\)\s*)?)?$/i,
        /^(function\s+solution\s*\(\s*\)\s*\{\s*\}\s*(solution\s*\(\s*\)\s*;?\s*)?)?$/i,
        /^(public\s+static\s+void\s+main\s*\(.*\)\s*\{\s*\})?$/i,
        /^(int\s+main\s*\(\s*\)\s*\{\s*(return\s+0\s*;?\s*)?\})?$/i,
      ];
      const isTemplate = !stripped || templatePatterns.some(p => p.test(stripped));
      if (isTemplate) {
        let noAnswerPrompt = '';
        if (q.question_type === 'coding') {
          noAnswerPrompt = `The user did not attempt this coding question. Provide the correct solution.
${langInstruction}

Question: ${q.question_text}

Return JSON:
{
  "feedback": "**No answer was provided.**\\n\\n**Correct Approach:**\\n[Explain the approach clearly]\\n\\n**Solution:**\\n\\\`\\\`\\\`\\n[Write the optimal solution code in ${solutionLanguage}]\\n\\\`\\\`\\\`\\n\\n**Time Complexity:** O(?)\\n**Space Complexity:** O(?)",
  "correct_answer": "Brief description of correct approach"
}`;
        } else if (q.question_type === 'aptitude') {
          noAnswerPrompt = `The user did not answer this aptitude question.

Question: ${q.question_text}
Correct Answer: ${q.expected_answer || 'N/A'}

Return JSON:
{
  "feedback": "**No answer was provided.**\\n\\n**Correct Answer:** [answer]\\n\\n**Explanation:** [step-by-step solution]",
  "correct_answer": "The correct answer"
}`;
        } else {
          noAnswerPrompt = `The user did not answer this HR interview question.

Question: ${q.question_text}
Key Points: ${q.expected_answer || 'N/A'}

Return JSON:
{
  "feedback": "**No answer was provided.**\\n\\n**Ideal Answer:**\\n[Write a strong sample answer covering all key points using the STAR method]",
  "correct_answer": "Key points for an ideal answer"
}`;
        }

        try {
          const noAnswerResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Return ONLY valid JSON. No markdown fences.' },
                { role: 'user', content: noAnswerPrompt },
              ],
              temperature: 0.3,
              max_tokens: 1200,
            }),
          });

          if (noAnswerResp.ok) {
            const noAnswerData = await noAnswerResp.json();
            const content = noAnswerData.choices?.[0]?.message?.content || '{}';
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned);
            await supabase.from('interview_questions').update({
              score: 0, is_correct: false,
              ai_feedback: parsed.feedback || 'No answer provided.',
              expected_answer: parsed.correct_answer || q.expected_answer || null,
            }).eq('id', q.id);
          } else {
            await supabase.from('interview_questions').update({
              score: 0, is_correct: false, ai_feedback: 'No answer provided.',
            }).eq('id', q.id);
          }
        } catch {
          await supabase.from('interview_questions').update({
            score: 0, is_correct: false, ai_feedback: 'No answer provided.',
          }).eq('id', q.id);
        }

        evaluations.push({ id: q.id, score: 0 });
        continue;
      }

      // Build evaluation prompt based on question type
      let evalPrompt = '';
      if (q.question_type === 'coding') {
        evalPrompt = `You are an expert coding interviewer. Evaluate this coding answer thoroughly.
${langInstruction}

Question: ${q.question_text}
Expected Approach: ${q.expected_answer || 'N/A'}
User's Code: ${userResponse}

CRITICAL RULES FOR OPTIMAL SOLUTION:
- First determine the best possible time/space complexity for this problem.
- If the user's solution ALREADY achieves the best possible complexity, set "optimal_solution" to "" (empty string) and clearly state in the feedback that the user's solution is already optimal. Do NOT repeat their code as the optimal solution.
- ONLY if the user's solution is NOT optimal, provide a better approach in "optimal_solution" with a clear complexity comparison showing why it is better.
- All code MUST be in ${solutionLanguage}.

Return JSON with these fields:
{
  "score": 0-10,
  "is_correct": true/false,
  "feedback": "Detailed markdown feedback including:\n- **Correctness**: Does the solution work for all test cases?\n- **Time Complexity**: What is the time complexity?\n- **Space Complexity**: What is the space complexity?\n- **Optimality**: Is this the best possible approach? If YES, clearly state 'Your solution is already optimal!' If NO, explain what a better approach would be.\n- **Strengths**: What did the user do well?\n- **Areas to Improve**: Only if applicable\n- **Edge Cases**: Any missed edge cases?",
  "optimal_solution": "ONLY if the user's solution is NOT optimal. Provide a more efficient solution in ${solutionLanguage} with complexity comparison. If user's solution IS already optimal, set this to empty string.",
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
          max_tokens: 2000,
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
      } catch (parseErr) {
        console.error(`Failed to parse eval for question ${q.id}:`, parseErr.message);
        console.error('Raw eval content:', content.substring(0, 500));
        // Try to extract JSON from the content
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) result = JSON.parse(jsonMatch[0]);
        } catch { /* use defaults */ }
      }

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

    // Build skill gap data
    let skillGapSection = '';
    if (extractedSkills.length > 0) {
      // Map skill performance from questions
      const skillScores: Record<string, { total: number; count: number; claimed: string }> = {};
      for (const skill of extractedSkills) {
        skillScores[skill.skill_name.toLowerCase()] = { total: 0, count: 0, claimed: skill.proficiency_level };
      }
      for (const q of questions) {
        if (q.skill_name) {
          const key = q.skill_name.toLowerCase();
          // Find matching extracted skill
          for (const skill of extractedSkills) {
            if (key.includes(skill.skill_name.toLowerCase()) || skill.skill_name.toLowerCase().includes(key)) {
              if (!skillScores[skill.skill_name.toLowerCase()]) {
                skillScores[skill.skill_name.toLowerCase()] = { total: 0, count: 0, claimed: skill.proficiency_level };
              }
              const qScore = evaluations.find(e => e.id === q.id)?.score || 0;
              skillScores[skill.skill_name.toLowerCase()].total += qScore;
              skillScores[skill.skill_name.toLowerCase()].count += 1;
            }
          }
        }
      }

      const gapLines = Object.entries(skillScores)
        .filter(([, v]) => v.count > 0)
        .map(([skill, v]) => {
          const avg = Math.round(v.total / v.count);
          return `- ${skill}: Claimed "${v.claimed}", scored ${avg}/10 avg across ${v.count} question(s)`;
        }).join('\n');

      if (gapLines) {
        skillGapSection = `\n\nSKILL GAP DATA (compare claimed proficiency vs actual performance):\n${gapLines}\n\nBased on this data, include a "📊 Skill Gap Analysis" section that:\n- Identifies any mismatches between claimed proficiency and actual scores\n- If someone claims "intermediate" or "advanced" but scores poorly, call it out constructively\n- Suggest realistic self-assessment adjustments\n- Highlight skills where performance matches or exceeds expectations`;
      }
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

Write a SHORT, punchy interview summary in markdown. Be direct, no fluff:
- One bold opening line with the vibe (e.g. "🔥 Solid performance!" or "⚡ Room to grow")
- 2-3 bullet points: mix of strengths and improvements, be specific not generic
- One actionable tip to level up
${skillGapSection ? skillGapSection : ''}

Keep it conversational and motivating. ${skillGapSection ? 'Include the skill gap analysis section as described above.' : 'No headers, no sections, no walls of text.'}`,
        }],
        max_tokens: 800,
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