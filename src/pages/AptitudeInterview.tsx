import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Timer, ChevronLeft, ChevronRight, Send, Loader2, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  skill_name: string | null;
  options: Record<string, string> | null;
  expected_answer: string | null;
  user_answer: string | null;
  time_taken_seconds: number | null;
}

const difficultyColors: Record<string, string> = {
  easy: "text-brand-emerald bg-emerald-500/15 border-emerald-500/30",
  medium: "text-brand-amber bg-amber-500/15 border-amber-500/30",
  hard: "text-brand-rose bg-rose-500/15 border-rose-500/30",
};

export default function AptitudeInterview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(20 * 60); // 20 minutes
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    if (!user || !id) return;
    const fetchQuestions = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("interview_questions")
        .select("*")
        .eq("interview_id", id)
        .order("order_index", { ascending: true });
      if (data) {
        setQuestions(data);
        // Restore previous answers
        const saved: Record<string, string> = {};
        data.forEach((q: Question) => {
          if (q.user_answer) saved[q.id] = q.user_answer;
        });
        setAnswers(saved);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [user, id]);

  useEffect(() => {
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx]);

  // Total interview timer (20 minutes) with auto-submit
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTimer((t) => {
        if (t <= 1 && !autoSubmitTriggered.current) {
          autoSubmitTriggered.current = true;
          document.getElementById("auto-submit-trigger")?.click();
        }
        return t > 0 ? t - 1 : 0;
      });
    }, 1000);
    return () => { if (totalTimerRef.current) clearInterval(totalTimerRef.current); };
  }, []);

  // Sync selectedOption when navigating
  useEffect(() => {
    const q = questions[currentIdx];
    if (q) {
      setSelectedOption(answers[q.id] || "");
    }
  }, [currentIdx, questions, answers]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const saveAnswer = useCallback(async (questionId: string, userAnswer: string, timeTaken: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("interview_questions")
      .update({ user_answer: userAnswer, time_taken_seconds: timeTaken })
      .eq("id", questionId);
  }, []);

  const handleSelectOption = (optionKey: string) => {
    setSelectedOption(optionKey);
    const q = questions[currentIdx];
    if (q) {
      setAnswers(prev => ({ ...prev, [q.id]: optionKey }));
    }
  };

  const handleNext = async () => {
    const q = questions[currentIdx];
    if (!q) return;
    await saveAnswer(q.id, selectedOption, timer);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = async () => {
    const q = questions[currentIdx];
    if (!q) return;
    await saveAnswer(q.id, selectedOption, timer);
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    const q = questions[currentIdx];
    if (!q || !id) return;
    setSubmitting(true);
    await saveAnswer(q.id, selectedOption, timer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("interviews").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", id);

    navigate(`/interview/results/${id}`);
  };

  const currentQ = questions[currentIdx];
  const options = currentQ?.options as Record<string, string> | null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No questions found for this test.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30">
              <Brain className="h-4 w-4 text-brand-amber" />
            </div>
            <span className="font-semibold">Aptitude Test</span>
            <div className="flex gap-1 ml-2">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIdx
                      ? "w-6 bg-primary"
                      : answers[q.id]
                        ? "w-3 bg-primary/40"
                        : "w-3 bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className={`font-mono font-medium ${timer > 120 ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timer)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Question {currentIdx + 1}</span>
            {currentQ?.difficulty && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[currentQ.difficulty] || difficultyColors.medium}`}>
                {currentQ.difficulty}
              </span>
            )}
            {currentQ?.skill_name && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border/60">
                {currentQ.skill_name}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none text-lg mb-8">
            <ReactMarkdown>{currentQ?.question_text || ""}</ReactMarkdown>
          </div>

          {/* MCQ Options */}
          {options && Object.keys(options).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left rounded-xl border p-4 transition-all flex items-center gap-3 ${
                    selectedOption === key
                      ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                      : "border-border/60 bg-secondary/30 hover:bg-secondary/50 hover:border-border"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    selectedOption === key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 text-muted-foreground"
                  }`}>
                    {selectedOption === key ? <CheckCircle2 className="h-4 w-4" /> : key}
                  </div>
                  <span className="text-sm">{value}</span>
                </button>
              ))}
            </div>
          ) : (
            // Fallback text input if no options provided
            <textarea
              value={selectedOption}
              onChange={(e) => handleSelectOption(e.target.value)}
              placeholder="Type your answer..."
              className="w-full min-h-24 rounded-xl bg-secondary/50 border border-border/60 p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0} className="flex-1">
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {currentIdx < questions.length - 1 ? (
            <Button onClick={handleNext} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Submit Test
            </Button>
          )}
        </div>

        {/* Answer summary */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={async () => {
                const curr = questions[currentIdx];
                if (curr) await saveAnswer(curr.id, selectedOption, timer);
                setCurrentIdx(i);
              }}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-all ${
                i === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : answers[q.id]
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground border border-border/60"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
