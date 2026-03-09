

## Plan: Adaptive Difficulty, Solution Language Choice & Skill Gap Analysis

### 1. Add "Adaptive" Difficulty Option (InterviewSelect.tsx)

Add a 4th difficulty button called **"Adaptive"** alongside Easy/Medium/Hard. When selected, the system will use each skill's `proficiency_level` from `extracted_skills` to set per-question difficulty — e.g., a skill marked "advanced" gets hard questions, "beginner" gets easy ones.

**Changes:**
- **`src/pages/InterviewSelect.tsx`**: Add "Adaptive" to the difficulty selector with a distinct style (e.g., gradient/blue). Pass `difficulty: "adaptive"` to the edge function.
- **`supabase/functions/generate-questions/index.ts`**: Handle `difficulty === 'adaptive'` by building a prompt that instructs the AI to vary question difficulty per skill based on the proficiency level provided (e.g., "For React (Advanced), generate hard questions. For Python (Beginner), generate easy questions.").

### 2. Add Solution Language Selector (InterviewSelect.tsx + evaluate-interview)

Add a **"Preferred Solution Language"** dropdown on the InterviewSelect page (options: Python, JavaScript, Java, C++). Store the selection and pass it through to evaluation so AI feedback/solutions are written in that language.

**Changes:**
- **`src/pages/InterviewSelect.tsx`**: Add a language selector dropdown below difficulty. Store in state as `solutionLanguage`. Pass it when creating the interview.
- **Database migration**: Add `solution_language` column (text, default 'python') to `interviews` table.
- **`supabase/functions/evaluate-interview/index.ts`**: Read `solution_language` from the interview record. Inject into all evaluation prompts: "Provide all code solutions and examples in {language}."

### 3. Skill Gap Analysis in Overall Feedback (evaluate-interview)

Enhance the overall feedback prompt to include per-skill performance data so the AI can identify mismatches between claimed proficiency and actual performance.

**Changes:**
- **`supabase/functions/evaluate-interview/index.ts`**:
  - Fetch user's `extracted_skills` (with `proficiency_level`) for comparison.
  - Build a skill performance summary: for each skill that appeared in questions, compute average score vs. claimed level.
  - Pass this data to the overall feedback prompt with instructions like: "Identify skill gaps where the candidate's claimed proficiency doesn't match their performance. For example, if they claim 'intermediate' in Java but scored poorly on basic Java questions, highlight this gap and suggest realistic self-assessment."
  - Add a dedicated **"Skill Gap Analysis"** section in the feedback.

- **`src/pages/InterviewResults.tsx`**: No major changes needed — the existing `interview.feedback` markdown renderer will display the enhanced feedback automatically.

### Summary of Files Changed

| File | Change |
|------|--------|
| `src/pages/InterviewSelect.tsx` | Add Adaptive difficulty + solution language selector |
| `supabase/functions/generate-questions/index.ts` | Handle adaptive difficulty in prompt |
| `supabase/functions/evaluate-interview/index.ts` | Use solution language for code examples + skill gap analysis in overall feedback |
| Database migration | Add `solution_language` column to `interviews` table |

