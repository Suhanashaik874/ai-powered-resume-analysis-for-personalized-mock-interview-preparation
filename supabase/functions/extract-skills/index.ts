import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: 'You are an expert resume analyzer. Extract technical skills and tools/technologies separately. Return ONLY valid JSON array, no markdown.',
        }, {
          role: 'user',
          content: `Analyze this resume and extract all technical skills and tools/technologies with proficiency levels.\n\nIMPORTANT: Classify each item as either a "skill" or "tool":\n- "skill" = concepts, methodologies, soft skills (e.g. Data Structures, Problem Solving, Agile, Machine Learning, REST API Design)\n- "tool" = specific technologies, frameworks, languages, software, platforms (e.g. React, Python, Docker, Git, AWS, VS Code, MongoDB)\n\nResume:\n${resumeText.slice(0, 8000)}\n\nReturn JSON: [{"skill_name": "React", "proficiency_level": "advanced", "category": "tool"}]\nProficiency levels: beginner, intermediate, advanced, expert\nCategories: skill, tool`,
        }],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    let skills = [];
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      skills = JSON.parse(cleaned);
    } catch {
      skills = [];
    }

    return new Response(JSON.stringify({ skills }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
