import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { code, language, questionText } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = questionText
      ? `You are a code evaluator. You are given a coding question with test cases and a user's ${language} solution.

Your job:
1. Mentally execute the user's code against ALL the test cases provided in the question.
2. For each test case, show: Input, Expected Output, Actual Output (from the code), and ✅ PASS or ❌ FAIL.
3. After all test cases, show a summary: "X/Y test cases passed".
4. If all pass, add: "✅ All test cases passed!"
5. If any fail, briefly explain what went wrong.

Format your response exactly like this:
Test Case 1: ✅ PASS
  Input: ...
  Expected: ...
  Output: ...

Test Case 2: ❌ FAIL
  Input: ...
  Expected: ...
  Output: ...

Result: X/Y test cases passed

Do NOT include any markdown code fences. Keep it clean and readable.`
      : `You are a code execution engine. Execute the given ${language} code mentally and return ONLY the exact output that would be printed to stdout. If the code has no print/output statements, still try to determine what the function returns and show that. Do NOT include markdown or code fences. Return ONLY the raw output.`;

    const userContent = questionText
      ? `**Question:**\n${questionText}\n\n**User's ${language} Code:**\n\`\`\`\n${code}\n\`\`\``
      : code;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ output: 'Rate limit exceeded. Please wait and try again.', stderr: '' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Code evaluation service error');
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