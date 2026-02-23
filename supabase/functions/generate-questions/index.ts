import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { interviewType, skills = [], interviewId } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const skillList = skills.map((s: { skill_name: string; proficiency_level: string }) =>
      `${s.skill_name} (${s.proficiency_level})`).join(', ') || 'general programming';

    const typePrompts: Record<string, string> = {
      coding: `Generate 5 coding interview questions for a candidate with skills: ${skillList}. Mix easy/medium/hard. Include DSA problems, algorithm design.`,
      hr: `Generate 8 HR behavioral interview questions. Focus on leadership, teamwork, conflict resolution, problem-solving with STAR method.`,
      aptitude: `Generate 15 aptitude questions covering: logical reasoning (5), verbal ability (5), quantitative aptitude (5). Multiple choice format.`,
      combined: `Generate 20 mixed interview questions: 7 coding (DSA), 7 HR behavioral, 6 aptitude (logical/verbal/quant). Skills: ${skillList}.`,
    };

    const prompt = typePrompts[interviewType] || typePrompts.coding;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    let questions = [];
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse questions JSON:', content);
      questions = [];
    }

    return new Response(JSON.stringify({ questions, interviewId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-questions error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
