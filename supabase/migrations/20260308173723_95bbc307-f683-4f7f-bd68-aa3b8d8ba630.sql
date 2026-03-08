CREATE POLICY "Users can delete own skills"
ON public.extracted_skills
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);