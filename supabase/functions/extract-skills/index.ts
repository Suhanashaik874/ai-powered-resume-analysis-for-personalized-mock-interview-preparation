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
          content: 'You are an expert resume analyzer. Extract ONLY technologies, tools, frameworks, programming languages, libraries, platforms, and software. Do NOT include soft skills, methodologies, or concepts. Return ONLY valid JSON array, no markdown.',
        }, {
          role: 'user',
          content: `Analyze this resume and extract ONLY technologies, tools, frameworks, programming languages, libraries, and platforms with proficiency levels.\n\nExamples of what TO include: React, Python, Docker, AWS, MongoDB, Git, TensorFlow, SQL, Kubernetes, VS Code\nExamples of what NOT to include: Problem Solving, Communication, Agile, Leadership, Data Structures\n\nResume:\n${resumeText.slice(0, 8000)}\n\nReturn JSON: [{"skill_name": "React", "proficiency_level": "advanced"}]\nProficiency levels: beginner, intermediate, advanced, expert`,
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
