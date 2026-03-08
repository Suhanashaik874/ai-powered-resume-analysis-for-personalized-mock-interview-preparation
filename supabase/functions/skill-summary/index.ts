import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { skillName, proficiencyLevel } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) throw new Error('LOVABLE_API_KEY is not configured');
    if (!skillName) throw new Error('skillName is required');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are a concise technical educator. Provide a structured skill revision summary. Return ONLY valid JSON, no markdown wrapping.`,
        }, {
          role: 'user',
          content: `Create a revision summary for the technology/skill: "${skillName}" (proficiency: ${proficiencyLevel || 'intermediate'}).

Return JSON with this exact structure:
{
  "title": "Brief title like 'React - Frontend Library'",
  "summary": "2-3 sentence overview of what this technology is and why it matters",
  "keyConcepts": ["concept1", "concept2", "concept3", "concept4", "concept5"],
  "commonUseCases": ["use case 1", "use case 2", "use case 3"],
  "interviewTips": ["tip1", "tip2", "tip3"],
  "codeExample": "A short practical code snippet if applicable, or empty string if not a programming tool",
  "realWorldExample": "A brief real-world scenario where this skill is used in production"
}`,
        }],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    let result = {};
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { title: skillName, summary: 'Could not generate summary.', keyConcepts: [], commonUseCases: [], interviewTips: [], codeExample: '', realWorldExample: '' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
