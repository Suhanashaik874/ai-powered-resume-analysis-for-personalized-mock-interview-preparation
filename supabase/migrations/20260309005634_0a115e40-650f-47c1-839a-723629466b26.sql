-- Allow users to update their own extracted skills (proficiency levels)
CREATE POLICY "Users can update own skills"
ON public.extracted_skills
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);