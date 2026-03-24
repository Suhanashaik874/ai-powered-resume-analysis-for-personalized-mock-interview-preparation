import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { interviewType, skills = [], interviewId, resumeText = '', difficulty = 'medium', solutionLanguage = 'python' } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const skillList = skills.map((s: { skill_name: string; proficiency_level: string }) =>
      `${s.skill_name} (${s.proficiency_level})`).join(', ') || 'general programming';

    const questionCounts: Record<string, number> = {
      coding: 3, hr: 8, aptitude: 15, combined: 15,
    };
    const count = questionCounts[interviewType] || 5;

    // Extract project info hint for HR
    const projectContext = resumeText
      ? `\n\nThe candidate's resume includes the following content (use it to generate project-specific questions):\n${resumeText.substring(0, 3000)}`
      : '';

    let difficultyInstruction = '';
    if (difficulty === 'adaptive') {
      // Build per-skill difficulty mapping
      const skillDifficultyMap = skills.map((s: { skill_name: string; proficiency_level: string }) => {
        const level = s.proficiency_level?.toLowerCase() || 'beginner';
        let qDiff = 'easy';
        if (level === 'intermediate' || level === 'medium') qDiff = 'medium';
        else if (level === 'advanced' || level === 'expert') qDiff = 'hard';
        return `- For "${s.skill_name}" (claimed ${s.proficiency_level}): generate ${qDiff.toUpperCase()} difficulty questions`;
      }).join('\n');
      
      difficultyInstruction = `ADAPTIVE DIFFICULTY MODE: Vary question difficulty based on the candidate's claimed proficiency for each skill:\n${skillDifficultyMap}\n\nFor skills not listed, default to medium difficulty. Mark each question's difficulty field accordingly.`;
    } else {
      difficultyInstruction = {
        easy: 'All questions should be EASY difficulty — basic concepts, straightforward problems, simple scenarios. Suitable for beginners or freshers.',
        medium: 'All questions should be MEDIUM difficulty — moderate complexity requiring solid understanding. Suitable for intermediate candidates.',
        hard: 'All questions should be HARD difficulty — complex problems, advanced concepts, tricky edge cases. Suitable for experienced candidates.',
      }[difficulty] || '';
    }

    const langDisplayName: Record<string, string> = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++' };
    const langName = langDisplayName[solutionLanguage] || 'Python';

    const starterCodeExamples: Record<string, string> = {
      python: 'def solve(nums):\\n    # Write your solution here\\n    pass',
      javascript: 'function solve(nums) {\\n    // Write your solution here\\n}',
      java: 'class Solution {\\n    public int solve(int[] nums) {\\n        // Write your solution here\\n        return 0;\\n    }\\n}',
      cpp: '#include <vector>\\nusing namespace std;\\n\\nint solve(vector<int>& nums) {\\n    // Write your solution here\\n    return 0;\\n}',
    };
    const starterExample = starterCodeExamples[solutionLanguage] || starterCodeExamples.python;

    const typePrompts: Record<string, string> = {
      coding: `Generate ${count} ALGORITHMIC CODING problems. Candidate skills: ${skillList}. ${difficultyInstruction}
CRITICAL RULES:
- Every problem MUST be a CLEAR, EASY-TO-UNDERSTAND real-world story or scenario. Write as if explaining to a friend. Examples:
  * "You run a small bookstore. Every day you record how many books you sold. Given a list of daily sales, find the best consecutive days where total sales were highest."
  * "A group of friends are planning a road trip. They have a map with cities and distances. Help them find the shortest route that visits all cities exactly once."
- The scenario should make the algorithm obvious when you think about it, but don't mention the algorithm name
- Use simple language, short sentences. Avoid jargon. The scenario IS the problem.
- DO NOT include any function signature, starter code, or code template in question_text — those go in "starter_code"
- ONLY generate: array/string manipulation, tree/graph traversal, dynamic programming, sorting, searching, linked lists, stacks, queues, recursion, math problems
- NEVER generate: system design, cloud architecture, theoretical questions
- Each problem must include: clear input/output format, constraints, and exactly 2 test cases showing Input and expected Output
- Keep each problem under 200 words
- Include a "starter_code" field with a ${langName} function/class template (e.g. "${starterExample}")
- ALL starter code MUST be in ${langName}.`,

      hr: `Generate ${count} HR behavioral interview questions for a candidate. ${difficultyInstruction}${projectContext}
Requirements:
- 3-4 questions should be specifically about projects mentioned in the resume (if available)
- Ask about specific technologies used, challenges faced, and contributions
- Include questions about leadership, teamwork, conflict resolution
- Include STAR method scenario questions
- Mix behavioral and situational questions`,

      aptitude: `Generate ${count} aptitude MCQ questions. ${difficultyInstruction} Covering:
- 5 logical reasoning questions
- 5 verbal ability questions  
- 5 quantitative aptitude questions
Each question MUST have exactly 4 options (A, B, C, D) and one correct answer.
Format: Include the options as part of the question or as a separate field.`,

      combined: `Generate ${count} mixed interview questions. ${difficultyInstruction}
- 5 coding questions (DSA with STORY-BASED scenarios, include starter_code field with ${langName} function signature. Do NOT put example test cases in question_text — put them as comments in starter_code instead)
- 5 HR behavioral questions${projectContext ? ' (include project-specific ones)' : ''}
- 5 aptitude MCQ questions (with 4 options each)
Skills: ${skillList}.${projectContext}`,
    };

    const prompt = typePrompts[interviewType] || typePrompts.coding;

    // Build the JSON schema instructions based on type
    let jsonFields = '';
    if (interviewType === 'aptitude') {
      jsonFields = `- "question_type": "aptitude"
- "question_text": the question string
- "options": {"A": "option text", "B": "option text", "C": "option text", "D": "option text"}
- "expected_answer": the correct option letter (e.g. "B")
- "difficulty": "easy", "medium", or "hard"
- "order_index": integer starting from 0`;
    } else if (interviewType === 'coding') {
      jsonFields = `- "question_type": "coding"
- "question_text": full scenario/story-based problem description with test cases and constraints (NO function signatures or code here)
- "starter_code": a ${langName} function/class as starter code template (e.g. "${starterExample}")
- "expected_answer": brief description of optimal approach with time/space complexity
- "difficulty": "easy", "medium", or "hard"
- "skill_name": relevant skill (e.g. "Arrays", "Dynamic Programming")
- "order_index": integer starting from 0`;
    } else if (interviewType === 'hr') {
      jsonFields = `- "question_type": "hr"
- "question_text": the question string
- "expected_answer": key points that a good answer should cover
- "difficulty": "easy", "medium", or "hard"
- "skill_name": category like "Leadership", "Teamwork", "Project Experience"
- "order_index": integer starting from 0`;
    } else {
      jsonFields = `- "question_type": one of "coding", "hr", "aptitude"
- "question_text": the question (for aptitude include options in text, for coding use story-based scenarios WITHOUT code)
- "starter_code": for coding questions only — ${langName} function/class as starter code
- "options": for aptitude questions only: {"A": "...", "B": "...", "C": "...", "D": "..."}
- "expected_answer": correct answer or key points
- "difficulty": "easy", "medium", or "hard"
- "skill_name": relevant skill or category
- "order_index": integer starting from 0`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: 'You are an expert technical interviewer. Return ONLY a valid JSON array. Do not use markdown code fences. Keep all string values properly escaped for JSON.',
        }, {
          role: 'user',
          content: `${prompt}\n\nReturn a JSON array where each element has these exact fields:\n${jsonFields}\n\nReturn ONLY the JSON array, nothing else.`,
        }],
        temperature: 0.7,
        max_tokens: interviewType === 'combined' ? 12000 : 8000,
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
      let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) cleaned = arrayMatch[0];
      questions = JSON.parse(cleaned);
    } catch (e1) {
      console.error('Failed to parse questions JSON:', e1.message);
      console.error('Raw content (first 500 chars):', content.substring(0, 500));
      try {
        let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) cleaned = arrayMatch[0];
        cleaned = cleaned.replace(/\\'/g, "'");
        // Try to fix truncated JSON by closing open brackets
        let bracketCount = 0;
        for (const ch of cleaned) { if (ch === '[') bracketCount++; if (ch === ']') bracketCount--; }
        for (let i = 0; i < bracketCount; i++) cleaned += ']';
        // Try to fix truncated objects
        cleaned = cleaned.replace(/,\s*$/, '');
        if (cleaned.endsWith('[')) cleaned += ']';
        questions = JSON.parse(cleaned);
      } catch {
        console.error('Recovery also failed, raw length:', content.length);
        questions = [];
      }
    }

    // Normalize questions
    questions = questions.map((q: Record<string, unknown>, i: number) => ({
      question_type: q.question_type || interviewType,
      question_text: q.question_text || '',
      order_index: q.order_index ?? i,
      options: q.options || null,
      expected_answer: q.expected_answer || null,
      difficulty: q.difficulty || difficulty,
      skill_name: q.skill_name || null,
      starter_code: q.starter_code || null,
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
