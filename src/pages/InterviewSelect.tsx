import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, MessageSquare, Brain, Target, ChevronRight, Loader2, Clock, Zap, Gauge, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    questions: 3,
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
    duration: "20 min",
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
    questions: 15,
    duration: "45 min",
  },
];


export default function InterviewSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(searchParams.get("type"));
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [solutionLanguage, setSolutionLanguage] = useState<string>("python");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!selected || !user) return;
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: interview, error: interviewError } = await (supabase as any)
        .from("interviews")
        .insert({
          user_id: user.id,
          interview_type: selected,
          status: "in_progress",
          solution_language: solutionLanguage,
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
      } else if (selected === "combined") {
        navigate(`/interview/combined/${interviewId}`);
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
          <h1 className="text-4xl font-bold mb-3">Select Interview Type</h1>
          <p className="text-muted-foreground text-lg">Choose a mock interview to practice.</p>
        </motion.div>

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
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { value: "easy", label: "Easy", color: "border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10", active: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-500/20" },
                { value: "medium", label: "Medium", color: "border-amber-500/40 hover:border-amber-400 bg-amber-500/10", active: "ring-2 ring-amber-500 border-amber-400 bg-amber-500/20" },
                { value: "hard", label: "Hard", color: "border-rose-500/40 hover:border-rose-400 bg-rose-500/10", active: "ring-2 ring-rose-500 border-rose-400 bg-rose-500/20" },
                { value: "adaptive", label: "Adaptive", color: "border-violet-500/40 hover:border-violet-400 bg-gradient-to-r from-violet-500/10 to-cyan-500/10", active: "ring-2 ring-violet-500 border-violet-400 bg-gradient-to-r from-violet-500/20 to-cyan-500/20" },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`px-5 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-1.5 ${
                    difficulty === d.value ? d.active : d.color
                  }`}
                >
                  {d.value === "adaptive" && <Sparkles className="h-3.5 w-3.5" />}
                  {d.label}
                </button>
              ))}
            </div>
            {difficulty === "adaptive" && (
              <p className="text-xs text-muted-foreground mt-2 text-center max-w-md">
                Questions will match each skill's proficiency level from your resume
              </p>
            )}
          </motion.div>
        )}

        {/* Solution Language Selection - Only for coding interviews */}
        {selected && (selected === "coding" || selected === "combined") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Preferred Solution Language
            </h3>
            <Select value={solutionLanguage} onValueChange={setSolutionLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI feedback & solutions will be provided in this language
            </p>
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
      </div>
    </div>
  );
}
