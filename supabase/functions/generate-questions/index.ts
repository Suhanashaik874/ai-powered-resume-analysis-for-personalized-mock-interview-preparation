import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { interviewType, skills = [], interviewId } = await req.json();
    const apiKey = Deno.env.get('AI_API_KEY');

    const skillList = skills.map((s: { skill_name: string; proficiency_level: string }) =>
      `${s.skill_name} (${s.proficiency_level})`).join(', ') || 'general programming';

    const typePrompts: Record<string, string> = {
      coding: `Generate 5 coding interview questions for a candidate with skills: ${skillList}. Mix easy/medium/hard. Include DSA problems, algorithm design.`,
      hr: `Generate 8 HR behavioral interview questions. Focus on leadership, teamwork, conflict resolution, problem-solving with STAR method.`,
      aptitude: `Generate 15 aptitude questions covering: logical reasoning (5), verbal ability (5), quantitative aptitude (5). Multiple choice format.`,
      combined: `Generate 20 mixed interview questions: 7 coding (DSA), 7 HR behavioral, 6 aptitude (logical/verbal/quant). Skills: ${skillList}.`,
    };

    const prompt = typePrompts[interviewType] || typePrompts.coding;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are an expert technical interviewer. Return ONLY valid JSON array of questions, no markdown.',
        }, {
          role: 'user',
          content: `${prompt}\n\nReturn JSON array: [{"question_type": "coding|hr|aptitude|logical|verbal", "difficulty": "easy|medium|hard", "question_text": "...", "expected_answer": "...", "skill_name": "..." }]`,
        }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    let questions = [];
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      questions = [];
    }

    return new Response(JSON.stringify({ questions, interviewId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
