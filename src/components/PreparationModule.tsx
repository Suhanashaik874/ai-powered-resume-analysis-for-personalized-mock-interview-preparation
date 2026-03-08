import { motion } from "framer-motion";
import { FileCode2, Lightbulb, PenTool, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const preparationResources = [
  {
    category: "Coding Prep",
    icon: FileCode2,
    iconColor: "text-brand-cyan",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    color: "from-cyan-500/20 to-blue-600/10",
    border: "border-cyan-500/30 hover:border-cyan-400",
    topics: [
      { title: "Arrays & Strings", desc: "Master fundamental data manipulation", difficulty: "Easy" },
      { title: "Linked Lists & Stacks", desc: "Linear data structures deep dive", difficulty: "Easy" },
      { title: "Trees & Graphs", desc: "Hierarchical & network structures", difficulty: "Medium" },
      { title: "Dynamic Programming", desc: "Optimization & memoization patterns", difficulty: "Hard" },
      { title: "Sorting & Searching", desc: "Essential algorithm techniques", difficulty: "Medium" },
    ],
  },
  {
    category: "Aptitude Prep",
    icon: Lightbulb,
    iconColor: "text-brand-amber",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    color: "from-amber-500/20 to-yellow-600/10",
    border: "border-amber-500/30 hover:border-amber-400",
    topics: [
      { title: "Number Systems", desc: "HCF, LCM, divisibility rules", difficulty: "Easy" },
      { title: "Percentages & Ratios", desc: "Profit, loss, and proportions", difficulty: "Easy" },
      { title: "Time & Work", desc: "Pipes, cisterns, and efficiency", difficulty: "Medium" },
      { title: "Logical Reasoning", desc: "Puzzles, seating, and arrangements", difficulty: "Medium" },
      { title: "Data Interpretation", desc: "Charts, tables, and graphs", difficulty: "Hard" },
    ],
  },
  {
    category: "HR & Soft Skills",
    icon: PenTool,
    iconColor: "text-brand-emerald",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    color: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/30 hover:border-emerald-400",
    topics: [
      { title: "Tell Me About Yourself", desc: "Craft a compelling introduction", difficulty: "Easy" },
      { title: "STAR Method", desc: "Structure behavioral answers", difficulty: "Easy" },
      { title: "Conflict Resolution", desc: "Handle tricky situational questions", difficulty: "Medium" },
      { title: "Leadership & Teamwork", desc: "Showcase collaboration skills", difficulty: "Medium" },
      { title: "Salary Negotiation", desc: "Navigate compensation discussions", difficulty: "Hard" },
    ],
  },
  {
    category: "System Design",
    icon: BarChart3,
    iconColor: "text-brand-purple",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    color: "from-purple-500/20 to-indigo-600/10",
    border: "border-purple-500/30 hover:border-purple-400",
    topics: [
      { title: "Scalability Basics", desc: "Load balancing, caching, CDNs", difficulty: "Medium" },
      { title: "Database Design", desc: "SQL vs NoSQL, indexing, sharding", difficulty: "Medium" },
      { title: "API Design", desc: "REST, GraphQL, rate limiting", difficulty: "Medium" },
      { title: "Microservices", desc: "Service decomposition patterns", difficulty: "Hard" },
      { title: "Real-time Systems", desc: "WebSockets, pub/sub, event-driven", difficulty: "Hard" },
    ],
  },
];

const difficultyColor: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/15",
  Medium: "text-amber-400 bg-amber-500/15",
  Hard: "text-rose-400 bg-rose-500/15",
};

export function PreparationModule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Preparation Resources</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {preparationResources.map((resource, i) => (
          <motion.div
            key={resource.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`rounded-2xl border bg-gradient-to-br p-6 ${resource.color} ${resource.border}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${resource.iconBg}`}>
                <resource.icon className={`h-5 w-5 ${resource.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold">{resource.category}</h3>
            </div>

            <div className="space-y-3">
              {resource.topics.map((topic) => (
                <div
                  key={topic.title}
                  className="flex items-center justify-between rounded-xl bg-background/40 border border-border/40 px-4 py-3 hover:bg-background/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{topic.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{topic.desc}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3 ${difficultyColor[topic.difficulty]}`}>
                    {topic.difficulty}
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground"
              disabled
            >
              Coming Soon
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          📚 Preparation modules with interactive lessons and practice problems are coming soon!
        </p>
      </div>
    </motion.div>
  );
}
