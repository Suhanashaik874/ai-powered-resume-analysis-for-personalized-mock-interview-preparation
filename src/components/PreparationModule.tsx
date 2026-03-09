import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCode2, Lightbulb, PenTool, BarChart3, BookOpen, ChevronRight, Brain, Loader2 } from "lucide-react";
import { preparationCourses } from "@/data/preparationCourses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCode2, Lightbulb, PenTool, BarChart3,
};

const difficultyColor: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/15",
  Medium: "text-amber-400 bg-amber-500/15",
  Hard: "text-rose-400 bg-rose-500/15",
};

export function PreparationModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skillCount, setSkillCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count } = await (supabase as any)
        .from("extracted_skills")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setSkillCount(count ?? 0);
    };
    fetchCount();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Preparation Resources</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revise Your Skills - Dynamic Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border-indigo-500/20 p-6"
        >
          <button
            onClick={() => navigate("/preparation/skill-revision")}
            className="flex items-center gap-3 mb-5 w-full text-left group"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-indigo-500/15 border-indigo-500/30">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Revise Your Skills</h3>
              <p className="text-xs text-muted-foreground">
                {skillCount === null ? (
                  <Loader2 className="inline h-3 w-3 animate-spin" />
                ) : skillCount > 0 ? (
                  `${skillCount} skills from your resume`
                ) : (
                  "Upload a resume to get started"
                )}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-generated revision summaries for each technology extracted from your resume. Includes key concepts, use cases, code examples, and interview tips.
          </p>
        </motion.div>

        {/* Existing courses */}
        {preparationCourses.map((resource, i) => {
          const IconComp = iconMap[resource.icon] || BookOpen;
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`rounded-2xl border bg-gradient-to-br p-6 cursor-pointer transition-all hover:shadow-glow ${resource.color} ${resource.border}`}
              onClick={() => navigate(`/preparation/${resource.id}`)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${resource.iconBg}`}>
                  <IconComp className={`h-5 w-5 ${resource.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{resource.category}</h3>
                  <p className="text-xs text-muted-foreground">{resource.topics.length} topics</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {resource.id === "coding" && "Master data structures, algorithms, and problem-solving patterns for coding interviews."}
                {resource.id === "aptitude" && "Sharpen your numerical ability, logical reasoning, and data interpretation skills."}
                {resource.id === "hr" && "Prepare for behavioral questions, communication skills, and HR interview rounds."}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
