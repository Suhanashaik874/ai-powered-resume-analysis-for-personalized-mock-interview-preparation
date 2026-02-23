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

    const questionCounts: Record<string, number> = {
      coding: 5, hr: 8, aptitude: 15, combined: 20,
    };
    const count = questionCounts[interviewType] || 5;

    const typePrompts: Record<string, string> = {
      coding: `Generate ${count} coding interview questions for a candidate with skills: ${skillList}. Mix easy/medium/hard. Include DSA problems, algorithm design.`,
      hr: `Generate ${count} HR behavioral interview questions. Focus on leadership, teamwork, conflict resolution, problem-solving with STAR method.`,
      aptitude: `Generate ${count} aptitude questions covering: logical reasoning, verbal ability, quantitative aptitude. Multiple choice format.`,
      combined: `Generate ${count} mixed interview questions: 7 coding (DSA), 7 HR behavioral, 6 aptitude (logical/verbal/quant). Skills: ${skillList}.`,
    };

    const prompt = typePrompts[interviewType] || typePrompts.coding;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: 'You are an expert technical interviewer. Return ONLY a valid JSON array. Do not use markdown code fences. Do not use single quotes inside strings - use double quotes only. Keep expected_answer short (max 200 chars) with no code blocks.',
        }, {
          role: 'user',
          content: `${prompt}\n\nReturn a JSON array where each element has these exact fields:\n- "question_type": one of "coding", "hr", "aptitude"\n- "question_text": the question string\n- "order_index": integer starting from 0\n\nReturn ONLY the JSON array, nothing else.`,
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
      // Remove markdown fences and trim
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      // Try to extract JSON array if wrapped in other text
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }
      questions = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse questions JSON, attempting recovery...');
      // Try a more aggressive cleanup
      try {
        let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleaned = arrayMatch[0];
        }
        // Replace problematic escape sequences
        cleaned = cleaned.replace(/\\'/g, "'");
        questions = JSON.parse(cleaned);
      } catch {
        console.error('Recovery also failed, returning empty questions');
        questions = [];
      }
    }

    // Normalize questions to match DB schema
    questions = questions.map((q: Record<string, unknown>, i: number) => ({
      question_type: q.question_type || interviewType,
      question_text: q.question_text || '',
      order_index: q.order_index ?? i,
    }));

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
