import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, MessageSquare, Brain, Target, ChevronRight, Loader2, Clock, Zap, Gauge, BookOpen, GraduationCap, Lightbulb, FileCode2, BarChart3, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const interviewTypes = [
  {
    type: "coding" as const,
    label: "Coding Interview",
    icon: Code2,
    description: "Algorithm & data structure problems with a live code editor. Supports JavaScript, Python, Java, and C++.",
    features: ["Monaco Code Editor", "Live Code Execution", "Multiple Languages", "AI Evaluation"],
    color: "from-cyan-500/20 to-blue-600/10",
    border: "border-cyan-500/30 hover:border-cyan-400",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    iconColor: "text-brand-cyan",
    questions: 5,
    duration: "30 min",
  },
  {
    type: "hr" as const,
    label: "HR Interview",
    icon: MessageSquare,
    description: "Behavioral & situational questions. Practice communication with voice-to-text support via Web Speech API.",
    features: ["Behavioral Questions", "Voice-to-Text", "Text Responses", "Communication Tips"],
    color: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-500/30 hover:border-emerald-400",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-brand-emerald",
    questions: 8,
    duration: "20 min",
  },
  {
    type: "aptitude" as const,
    label: "Aptitude Test",
    icon: Brain,
    description: "Logical reasoning, verbal ability, and quantitative aptitude under timed conditions.",
    features: ["Logical Reasoning", "Verbal Ability", "Quantitative", "Timed Questions"],
    color: "from-amber-500/20 to-yellow-600/10",
    border: "border-amber-500/30 hover:border-amber-400",
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-brand-amber",
    questions: 15,
    duration: "25 min",
  },
  {
    type: "combined" as const,
    label: "Full Mock Interview",
    icon: Target,
    description: "Comprehensive simulation combining coding, HR, and aptitude rounds — just like real interviews.",
    features: ["All Question Types", "Full Simulation", "Complete Feedback", "Rank & Score"],
    color: "from-purple-500/20 to-indigo-600/10",
    border: "border-purple-500/30 hover:border-purple-400",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-brand-purple",
    questions: 20,
    duration: "60 min",
  },
];

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

export default function InterviewSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(searchParams.get("type"));
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!selected || !user) return;
    setLoading(true);

    try {
      const { data: interview, error: interviewError } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          interview_type: selected,
          status: "in_progress",
        })
        .select()
        .single();

      if (interviewError) throw interviewError;

      const interviewId = interview.id;

      const { data: skills } = await supabase
        .from("extracted_skills")
        .select("skill_name, proficiency_level")
        .eq("user_id", user.id)
        .limit(20);

      let resumeText = '';
      if (selected === 'hr' || selected === 'combined') {
        const { data: resumes } = await supabase
          .from("resumes")
          .select("raw_text")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        resumeText = resumes?.[0]?.raw_text || '';
      }

      const { data: questionsData, error: qError } = await supabase.functions.invoke("generate-questions", {
        body: {
          interviewType: selected,
          interviewId: interviewId,
          skills: skills || [],
          resumeText,
          difficulty,
        },
      });

      if (qError) throw qError;

      const questions = questionsData?.questions || [];
      if (questions.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any).from("interview_questions").insert(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          questions.map((q: any, i: number) => ({
            interview_id: interviewId,
            question_type: q.question_type || selected,
            question_text: q.question_text,
            order_index: q.order_index ?? i,
            options: q.options || null,
            expected_answer: q.expected_answer || null,
            difficulty: q.difficulty || 'medium',
            skill_name: q.skill_name || null,
          }))
        );
        if (insertError) throw insertError;
      }

      if (selected === "hr") {
        navigate(`/interview/hr/${interviewId}`);
      } else if (selected === "aptitude") {
        navigate(`/interview/aptitude/${interviewId}`);
      } else {
        navigate(`/interview/${interviewId}`);
      }
    } catch (err: unknown) {
      toast({
        title: "Failed to start interview",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">Interview Hub</h1>
          <p className="text-muted-foreground text-lg">Practice mock interviews or prepare with topic-wise study material.</p>
        </motion.div>

        <Tabs defaultValue="mock" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-secondary/60 h-12">
            <TabsTrigger value="mock" className="text-sm font-medium gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
              Mock Interviews
            </TabsTrigger>
            <TabsTrigger value="prep" className="text-sm font-medium gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              Preparation
            </TabsTrigger>
          </TabsList>

          {/* Mock Interviews Tab */}
          <TabsContent value="mock">
            <div className="grid gap-6 md:grid-cols-2">
              {interviewTypes.map((interview, i) => (
                <motion.div
                  key={interview.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelected(interview.type)}
                  className={`relative cursor-pointer rounded-2xl border bg-gradient-to-br p-6 transition-all ${interview.color} ${interview.border} ${
                    selected === interview.type ? "ring-2 ring-primary shadow-glow" : ""
                  }`}
                >
                  {selected === interview.type && (
                    <div className="absolute top-4 right-4">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </div>
                    </div>
                  )}

                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${interview.iconBg}`}>
                    <interview.icon className={`h-6 w-6 ${interview.iconColor}`} />
                  </div>

                  <h3 className="text-xl font-bold mb-2">{interview.label}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{interview.description}</p>

                  <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {interview.questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{interview.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interview.features.map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-background/50 border border-border/60">
                        {f}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Difficulty Selection */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Select Difficulty
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: "easy", label: "Easy", color: "border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10", active: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-500/20" },
                    { value: "medium", label: "Medium", color: "border-amber-500/40 hover:border-amber-400 bg-amber-500/10", active: "ring-2 ring-amber-500 border-amber-400 bg-amber-500/20" },
                    { value: "hard", label: "Hard", color: "border-rose-500/40 hover:border-rose-400 bg-rose-500/10", active: "ring-2 ring-rose-500 border-rose-400 bg-rose-500/20" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                        difficulty === d.value ? d.active : d.color
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <Button
                onClick={handleStart}
                disabled={!selected || loading}
                className="px-10 py-6 text-base bg-gradient-primary text-primary-foreground hover:opacity-90 glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          </TabsContent>

          {/* Preparation Tab */}
          <TabsContent value="prep">
            <div className="grid gap-6 md:grid-cols-2">
              {preparationResources.map((resource, i) => (
                <motion.div
                  key={resource.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
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

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                📚 Preparation modules with interactive lessons and practice problems are coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
