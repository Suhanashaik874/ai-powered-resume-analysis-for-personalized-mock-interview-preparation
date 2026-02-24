
-- Add missing columns to interview_questions
ALTER TABLE public.interview_questions 
  ADD COLUMN IF NOT EXISTS options jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expected_answer text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS skill_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS user_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS time_taken_seconds integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_correct boolean DEFAULT NULL;

-- Add feedback column to interviews
ALTER TABLE public.interviews 
  ADD COLUMN IF NOT EXISTS feedback text DEFAULT NULL;
