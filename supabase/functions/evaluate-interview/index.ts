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

    const { data: interview } = await supabase
      .from('interviews')
      .select('solution_language, user_id, interview_type')
      .eq('id', interviewId)
      .single();

    const userId = interview?.user_id;

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
      const isTemplate = !stripped || stripped.length < 5;

      if (isTemplate) {
        // No answer provided - generate solution
        let prompt = '';
        if (q.question_type === 'coding') {
          prompt = `Question: ${q.question_text}

The user did not answer. Provide a clear, concise response as JSON:
{
  "feedback": "**No answer provided.**\\n\\n**Solution:**\\n\`\`\`python\\n[write clean solution]\\n\`\`\`\\n\\n- **Approach:** [1 line explanation]\\n- **Time:** O(?)\\n- **Space:** O(?)"
}`;
        } else if (q.question_type === 'aptitude') {
          prompt = `Question: ${q.question_text}
Correct Answer: ${q.expected_answer || 'N/A'}

The user did not answer. Provide response as JSON:
{
  "feedback": "**No answer provided.**\\n\\n- **Answer:** [correct answer]\\n- **Why:** [1-2 line step-by-step explanation]"
}`;
        } else {
          prompt = `Question: ${q.question_text}
Key Points: ${q.expected_answer || 'N/A'}

The user did not answer this HR question. Provide response as JSON:
{
  "feedback": "**No answer provided.**\\n\\n**Sample Answer:**\\n[Write a concise ideal answer using STAR method in 3-4 lines]"
}`;
        }

        let feedback = 'No answer provided.';
        try {
          const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'Return ONLY valid JSON. No markdown fences around the JSON.' },
                { role: 'user', content: prompt },
              ],
              temperature: 0.3,
              max_tokens: 1000,
            }),
          });

          if (resp.ok) {
            const data = await resp.json();
            const content = data.choices?.[0]?.message?.content || '';
            console.log(`No-answer AI response for ${q.id}:`, content.substring(0, 200));
            // Extract feedback value directly using regex to avoid nested code fence JSON issues
            const feedbackMatch = content.match(/"feedback"\s*:\s*"([\s\S]*?)"\s*\}/)
              || content.match(/"feedback"\s*:\s*"([\s\S]*?)$/);
            if (feedbackMatch) {
              feedback = feedbackMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\`/g, '`');
            } else {
              // Fallback: try normal JSON parse
              try {
                const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(cleaned);
                feedback = parsed.feedback || feedback;
              } catch {
                // Last resort: use content as-is minus JSON wrapper
                const raw = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/^\s*\{\s*"feedback"\s*:\s*"/,'').replace(/"\s*\}\s*$/,'');
                if (raw.length > 30) feedback = raw.replace(/\\n/g, '\n').replace(/\\"/g, '"');
              }
            }
          } else {
            console.error(`No-answer AI call failed for ${q.id}: ${resp.status} ${await resp.text()}`);
          }
        } catch (err) {
          console.error(`No-answer eval error for ${q.id}:`, err.message);
        }

        await supabase.from('interview_questions').update({
          score: 0, is_correct: false, ai_feedback: feedback,
        }).eq('id', q.id);

        evaluations.push({ id: q.id, score: 0 });
        continue;
      }

      // Build evaluation prompt based on question type
      let evalPrompt = '';
      if (q.question_type === 'coding') {
        evalPrompt = `Evaluate this coding answer. Be concise.

Question: ${q.question_text}
User's Code:
${userResponse}

Return JSON:
{
  "score": 0-10,
  "is_correct": true/false,
  "feedback": "Use bullet points:\\n- **Correct?** Yes/No + brief reason\\n- **Time:** O(?)\\n- **Space:** O(?)\\n- **What's good:** [1 line]\\n- **Improve:** [1 line, skip if perfect]\\n\\nIf not optimal, add:\\n**Better Solution:**\\n\`\`\`\\n[code]\\n\`\`\`"
}`;
      } else if (q.question_type === 'aptitude') {
        evalPrompt = `Evaluate this aptitude answer concisely.

Question: ${q.question_text}
Correct Answer: ${q.expected_answer || 'N/A'}
User's Answer: ${userResponse}

Return JSON:
{
  "score": 0 or 10,
  "is_correct": true/false,
  "feedback": "- **Your answer:** [what they said]\\n- **Correct answer:** [correct]\\n- **Explanation:** [2-3 line step-by-step]"
}`;
      } else {
        evalPrompt = `Evaluate this HR interview answer concisely.

Question: ${q.question_text}
Key Points: ${q.expected_answer || 'N/A'}
User's Answer: ${userResponse}

Return JSON:
{
  "score": 0-10,
  "is_correct": true/false,
  "feedback": "- **Score:** X/10\\n- **Good:** [1 line strength]\\n- **Improve:** [1 line suggestion]\\n- **Missing:** [key points missed, if any]"
}`;
      }

      let result = { score: 0, is_correct: false, feedback: '' };
      try {
        const evalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'Return ONLY valid JSON. No markdown fences around the JSON.' },
              { role: 'user', content: evalPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!evalResponse.ok) {
          console.error('AI eval error:', evalResponse.status, await evalResponse.text());
          evaluations.push({ id: q.id, score: 0 });
          continue;
        }

        const evalData = await evalResponse.json();
        const content = evalData.choices?.[0]?.message?.content || '{}';
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try {
          result = JSON.parse(cleaned);
        } catch {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) result = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error(`Eval error for ${q.id}:`, err.message);
      }

      totalScore += result.score || 0;

      await supabase.from('interview_questions').update({
        score: result.score || 0,
        is_correct: result.is_correct || false,
        ai_feedback: result.feedback || 'Evaluation unavailable.',
        expected_answer: q.expected_answer || null,
      }).eq('id', q.id);

      evaluations.push({ id: q.id, score: result.score });
    }

    // Build skill gap data
    let skillGapSection = '';
    if (extractedSkills.length > 0) {
      const skillScores: Record<string, { total: number; count: number; claimed: string }> = {};
      for (const skill of extractedSkills) {
        skillScores[skill.skill_name.toLowerCase()] = { total: 0, count: 0, claimed: skill.proficiency_level };
      }
      for (const q of questions) {
        if (q.skill_name) {
          const key = q.skill_name.toLowerCase();
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
          return `- ${skill}: Claimed "${v.claimed}", scored ${avg}/10`;
        }).join('\n');

      if (gapLines) {
        skillGapSection = `\nSkill performance:\n${gapLines}\nInclude 1-2 lines about skill gaps if any.`;
      }
    }

    // Overall feedback - keep it short
    const overallResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Interview score: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%).

Write a 3-4 line interview summary. Be direct:
- One bold opening line with emoji
- 2 bullet points: one strength, one improvement
- One actionable tip
${skillGapSection}

No headers. Keep it under 5 lines total.`,
        }],
        max_tokens: 400,
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
