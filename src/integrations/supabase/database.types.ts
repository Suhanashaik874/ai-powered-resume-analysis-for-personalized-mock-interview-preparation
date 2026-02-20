export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string | null;
          raw_text: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url?: string | null;
          raw_text?: string | null;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
          file_url?: string | null;
          raw_text?: string | null;
        };
      };
      extracted_skills: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string;
          skill_name: string;
          proficiency_level: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id: string;
          skill_name: string;
          proficiency_level?: string;
          created_at?: string;
        };
        Update: {
          skill_name?: string;
          proficiency_level?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          interview_type: "coding" | "aptitude" | "combined" | "hr";
          status: string;
          total_score: number;
          max_score: number;
          feedback: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          interview_type: "coding" | "aptitude" | "combined" | "hr";
          status?: string;
          total_score?: number;
          max_score?: number;
          feedback?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          total_score?: number;
          max_score?: number;
          feedback?: string | null;
          completed_at?: string | null;
        };
      };
      interview_questions: {
        Row: {
          id: string;
          interview_id: string;
          question_type: "coding" | "aptitude" | "logical" | "verbal" | "hr";
          difficulty: string;
          question_text: string;
          expected_answer: string | null;
          user_answer: string | null;
          user_code: string | null;
          is_correct: boolean | null;
          score: number;
          ai_feedback: string | null;
          skill_name: string | null;
          time_taken_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_type: "coding" | "aptitude" | "logical" | "verbal" | "hr";
          difficulty: string;
          question_text: string;
          expected_answer?: string | null;
          user_answer?: string | null;
          user_code?: string | null;
          is_correct?: boolean | null;
          score?: number;
          ai_feedback?: string | null;
          skill_name?: string | null;
          time_taken_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          user_answer?: string | null;
          user_code?: string | null;
          is_correct?: boolean | null;
          score?: number;
          ai_feedback?: string | null;
          time_taken_seconds?: number | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
