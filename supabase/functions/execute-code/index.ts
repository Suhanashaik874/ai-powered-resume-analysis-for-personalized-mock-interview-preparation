import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { code, language } = await req.json();
    const langConfig = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;

    console.log('Executing code with language:', langConfig.language, 'version:', langConfig.version);

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ name: 'main', content: code }],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });

    const rawText = await response.text();
    console.log('Piston raw response status:', response.status);
    console.log('Piston raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return new Response(JSON.stringify({ output: `Execution service error: ${rawText}`, stderr: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stdout = data?.run?.stdout || '';
    const stderr = data?.run?.stderr || '';
    const compileOutput = data?.compile?.stderr || data?.compile?.output || '';
    const output = stdout || compileOutput || stderr || 'No output (did you forget to print?)';

    return new Response(JSON.stringify({ output, stderr }), {
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
