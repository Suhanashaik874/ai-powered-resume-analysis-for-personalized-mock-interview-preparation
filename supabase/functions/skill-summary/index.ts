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
          content: `You are an expert software engineering mentor who creates detailed, easy-to-understand revision guides for technical skills. Your explanations should be thorough, beginner-friendly even for advanced topics, and include practical examples. Write as if you're explaining to a student preparing for a tech interview. Return ONLY valid JSON, no markdown wrapping.`,
        }, {
          role: 'user',
          content: `Create a comprehensive and detailed revision guide for the technology/skill: "${skillName}" (user proficiency: ${proficiencyLevel || 'intermediate'}).

Make every section rich and educational. Do NOT use one-liners — explain things properly so someone can actually learn from this.

Return JSON with this exact structure:
{
  "title": "Descriptive title like 'React - A JavaScript Library for Building User Interfaces'",
  "summary": "A detailed 5-8 sentence paragraph explaining what this technology is, its history/origin, why it was created, what problems it solves, why it's popular today, and how it fits in the broader tech ecosystem. Make it informative enough that someone unfamiliar can understand it.",
  "keyConcepts": [
    "Concept Name: 2-3 sentence explanation of this concept with a practical example of when you'd use it",
    "Another Concept: Detailed explanation...",
    "(provide 6-8 key concepts, each with proper explanation, not just keywords)"
  ],
  "commonUseCases": [
    "Use Case Title — Detailed 2-3 sentence description of how this technology is used in this scenario. Mention real companies or products if possible.",
    "(provide 5-6 detailed use cases)"
  ],
  "interviewTips": [
    "Tip with context: A detailed interview tip with an example of how to articulate it in an interview. Include a sample question and how to approach answering it.",
    "(provide 5-6 detailed tips with example questions)"
  ],
  "codeExample": "A practical, well-commented code example (15-30 lines) showing a realistic usage pattern. Include comments explaining each important line. If not a programming language/framework, provide a configuration example or CLI commands instead.",
  "realWorldExample": "A detailed 4-6 sentence real-world scenario describing how a well-known company (like Netflix, Uber, Airbnb, Google etc.) uses this technology in production. Include specific details like scale, why they chose it, and what problems it solved for them.",
  "prosAndCons": [
    {"type": "pro", "text": "Advantage with explanation of why this matters in practice"},
    {"type": "pro", "text": "Another advantage..."},
    {"type": "con", "text": "Limitation with explanation and common workaround"},
    {"type": "con", "text": "Another limitation..."},
    "(provide 3-4 pros and 2-3 cons)"
  ],
  "relatedTechnologies": ["Tech 1 - brief note on how it relates", "Tech 2 - brief note", "(3-5 related technologies)"]
}`,
        }],
        temperature: 0.5,
        max_tokens: 4000,
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
