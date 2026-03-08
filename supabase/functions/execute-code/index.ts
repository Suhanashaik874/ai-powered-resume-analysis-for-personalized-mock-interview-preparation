import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { code, language } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a code execution engine. Execute the given ${language} code mentally and return ONLY the exact output that would be printed to stdout. Do NOT include any explanation, markdown, or code fences. If the code has no print/output statements, return "No output (no print statement found)". If there is an error, return the error message as it would appear in the terminal. Return ONLY the raw output, nothing else.`,
          },
          {
            role: 'user',
            content: code,
          },
        ],
        temperature: 0,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ output: 'Rate limit exceeded. Please wait a moment and try again.', stderr: '' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Code execution service error');
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim() || 'No output';

    return new Response(JSON.stringify({ output, stderr: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('execute-code error:', err);
    return new Response(JSON.stringify({ error: err.message, output: `Error: ${err.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});