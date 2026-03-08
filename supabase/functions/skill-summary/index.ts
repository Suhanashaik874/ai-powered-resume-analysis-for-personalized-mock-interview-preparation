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
      const levelInstructions: Record<string, string> = {
        beginner: `The user is a BEGINNER. Focus on:
- Simple, jargon-free explanations with analogies
- What this technology is and WHY someone would use it (motivation)
- Basic foundational concepts only (no advanced patterns)
- A very simple "Hello World" style code example with heavy comments explaining every line
- Common beginner mistakes and how to avoid them
- Simple use cases that a beginner can relate to
- Interview tips should focus on basic definition questions and simple scenarios
- Keep real-world examples simple and relatable
- Do NOT include advanced patterns, architecture, or optimization topics`,

        intermediate: `The user is INTERMEDIATE. Focus on:
- Deeper explanations assuming basic knowledge exists
- Important patterns, best practices, and common pitfalls
- A practical code example showing a real-world pattern (not just hello world)
- Performance considerations and when to use vs not use this tech
- Interview tips with medium-difficulty questions and how to structure answers
- Real-world use cases with company examples
- Include pros/cons with practical implications`,

        advanced: `The user is ADVANCED. Focus on:
- Deep technical concepts, internal workings, and architecture patterns
- Advanced patterns, optimization techniques, and edge cases
- Complex code example showing advanced usage (design patterns, performance optimization, etc.)
- Detailed comparison with alternatives and when each is better
- Interview tips focusing on system design, trade-offs, and deep-dive questions
- Under-the-hood explanations (how it works internally, memory model, event loop, etc.)
- Advanced real-world scenarios at scale`,

        expert: `The user is an EXPERT. Focus on:
- Production-grade architecture and system design with this technology
- A complete real-world application flow example showing end-to-end architecture (e.g., how Netflix uses this in their microservices pipeline, request flow from user click to response)
- Performance tuning, benchmarking, and optimization at scale
- Contributing to the ecosystem, extending the technology, custom plugins/middleware
- Interview tips for Staff/Principal level — system design, trade-off analysis, leading technical decisions
- Detailed production incident scenarios and debugging strategies
- Code example should be production-grade: error handling, edge cases, monitoring
- Include architecture diagrams described in text (e.g., "User → API Gateway → Service A → Cache → DB")
- Focus on SCALE: millions of users, distributed systems, fault tolerance`,
      };

      const level = (proficiencyLevel || 'intermediate').toLowerCase();
      const instruction = levelInstructions[level] || levelInstructions.intermediate;

      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are an expert software engineering mentor creating revision guides tailored to the student's proficiency level. Adjust depth, complexity, and examples based on their level. Return ONLY valid JSON, no markdown wrapping.`,
        }, {
          role: 'user',
          content: `Create a comprehensive revision guide for: "${skillName}" (proficiency level: ${level}).

${instruction}

Return JSON with this exact structure:
{
  "title": "Descriptive title like 'React - A JavaScript Library for Building User Interfaces'",
  "proficiencyNote": "A 1-2 sentence note like 'This guide is tailored for ${level} level. It focuses on [what this level covers].'",
  "summary": "A detailed 5-8 sentence paragraph explaining this technology. Adjust complexity to ${level} level — beginners need simple language and analogies, experts need technical depth and architecture context.",
  "keyConcepts": [
    "Concept Name: Detailed explanation adjusted to ${level} level. Beginners get 2-3 simple sentences with analogies. Experts get deep technical details with internals.",
    "(provide ${level === 'beginner' ? '5-6 foundational' : level === 'expert' ? '8-10 advanced' : '6-8'} concepts)"
  ],
  "commonUseCases": [
    "Use Case — Description adjusted to ${level} level. Experts get production-scale scenarios with architecture details.",
    "(provide ${level === 'beginner' ? '3-4 simple' : level === 'expert' ? '5-6 production-scale' : '5-6'} use cases)"
  ],
  "interviewTips": [
    "Sample Question: How to answer it at ${level} level. Include what interviewers expect at this level.",
    "(provide 5-6 tips with sample Q&A)"
  ],
  "codeExample": "${level === 'beginner' ? 'A simple, heavily-commented example (10-15 lines) showing basic usage. Comment EVERY line.' : level === 'expert' ? 'A production-grade example (30-50 lines) with error handling, edge cases, and performance considerations.' : 'A practical example (15-30 lines) showing a real-world pattern with comments.'}",
  "realWorldExample": "${level === 'expert' ? 'A detailed end-to-end production flow (8-10 sentences) showing how a major company uses this at scale. Include request flow, architecture decisions, scale numbers, and lessons learned.' : level === 'advanced' ? 'A detailed 5-7 sentence scenario with specific architecture details and scale.' : 'A 4-6 sentence real-world scenario that is relatable and educational.'}",
  "prosAndCons": [
    {"type": "pro", "text": "Advantage explained at ${level} level"},
    {"type": "con", "text": "Limitation explained at ${level} level with workaround"},
    "(3-4 pros, 2-3 cons)"
  ],
  "relatedTechnologies": ["Tech - how it relates (3-5 items)"]${level === 'expert' ? ',\n  "architectureFlow": "A text-based architecture diagram showing end-to-end flow. Use arrows like: User → CDN → Load Balancer → API Gateway → Service → Cache → Database. Include 5-8 components with brief notes on each."' : ''}
}`,
        }],
        temperature: 0.5,
        max_tokens: ${level === 'expert' ? 6000 : level === 'advanced' ? 5000 : level === 'beginner' ? 3500 : 4000},
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
