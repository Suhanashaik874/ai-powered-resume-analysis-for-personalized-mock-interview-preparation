import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCode2, Lightbulb, PenTool, BarChart3, BookOpen, ChevronRight } from "lucide-react";
import { preparationCourses } from "@/data/preparationCourses";

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
        {preparationCourses.map((resource, i) => {
          const IconComp = iconMap[resource.icon] || BookOpen;
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className={`rounded-2xl border bg-gradient-to-br p-6 ${resource.color} ${resource.border}`}
            >
              <button
                onClick={() => navigate(`/preparation/${resource.id}`)}
                className="flex items-center gap-3 mb-5 w-full text-left group"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${resource.iconBg}`}>
                  <IconComp className={`h-5 w-5 ${resource.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{resource.category}</h3>
                  <p className="text-xs text-muted-foreground">{resource.topics.length} topics</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="space-y-3">
                {resource.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/preparation/${resource.id}/${topic.id}`)}
                    className="w-full flex items-center justify-between rounded-xl bg-background/40 border border-border/40 px-4 py-3 hover:bg-background/60 transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{topic.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{topic.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColor[topic.difficulty]}`}>
                        {topic.difficulty}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
