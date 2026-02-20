import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, XCircle, ChevronDown, ChevronUp, Home, RotateCcw, Loader2, Star, TrendingUp } from "lucide-react";
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
  user_answer: string | null;
  user_code: string | null;
  is_correct: boolean | null;
  score: number;
  ai_feedback: string | null;
  expected_answer: string | null;
  time_taken_seconds: number | null;
}

interface Interview {
  id: string;
  interview_type: string;
  status: string;
  total_score: number;
  max_score: number;
  feedback: string | null;
}

export default function InterviewResults() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    const fetchResults = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [iRes, qRes] = await Promise.all([
        (supabase as any).from("interviews").select("*").eq("id", id).single(),
        (supabase as any).from("interview_questions").select("*").eq("interview_id", id).order("created_at"),
      ]);
      if (iRes.data) setInterview(iRes.data);
      if (qRes.data) setQuestions(qRes.data);

      // If not yet evaluated, trigger evaluation
      const hasScores = qRes.data?.some((q: Question) => q.ai_feedback !== null);
      if (!hasScores && iRes.data?.status === "completed") {
        await triggerEvaluation(id);
      } else {
        setLoading(false);
      }
    };
    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  const triggerEvaluation = async (interviewId: string) => {
    setEvaluating(true);
    try {
      const { error } = await supabase.functions.invoke("evaluate-interview", {
        body: { interviewId },
      });
      if (error) throw error;

      // Refetch results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [iRes, qRes] = await Promise.all([
        (supabase as any).from("interviews").select("*").eq("id", interviewId).single(),
        (supabase as any).from("interview_questions").select("*").eq("interview_id", interviewId).order("created_at"),
      ]);
      if (iRes.data) setInterview(iRes.data);
      if (qRes.data) setQuestions(qRes.data);
    } catch (err: unknown) {
      toast({ title: "Evaluation failed", description: err instanceof Error ? err.message : "Could not evaluate interview", variant: "destructive" });
    } finally {
      setEvaluating(false);
      setLoading(false);
    }
  };

  const scorePercent = interview?.max_score && interview.max_score > 0
    ? Math.round((interview.total_score / interview.max_score) * 100)
    : 0;

  const scoreColor = scorePercent >= 80 ? "text-brand-emerald" : scorePercent >= 60 ? "text-brand-amber" : "text-brand-rose";
  const scoreGradient = scorePercent >= 80 ? "from-emerald-500 to-green-600" : scorePercent >= 60 ? "from-amber-500 to-yellow-600" : "from-rose-500 to-red-600";

  const formatTime = (s: number | null) => {
    if (!s) return "—";
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  if (loading || evaluating) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-7 w-7 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground">{evaluating ? "AI is evaluating your answers..." : "Loading results..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 glass-card rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${scoreGradient} opacity-5`} />
          <div className="relative z-10">
            <Trophy className={`mx-auto mb-4 h-12 w-12 ${scoreColor}`} />
            <div className={`text-7xl font-black mb-2 ${scoreColor}`}>{scorePercent}%</div>
            <div className="text-muted-foreground mb-1 text-lg">
              {interview?.total_score} / {interview?.max_score} points
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {interview?.interview_type} Interview
            </div>

            <div className="mt-6 flex justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-emerald">
                  {questions.filter(q => q.is_correct).length}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-rose">
                  {questions.filter(q => q.is_correct === false).length}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-amber">{questions.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Feedback */}
        {interview?.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 glass-card rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Overall Feedback
            </h2>
            <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
              <ReactMarkdown>{interview.feedback}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-semibold mb-4 text-lg">Question Breakdown</h2>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={q.id} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    {q.is_correct === true ? (
                      <CheckCircle className="h-5 w-5 text-brand-emerald" />
                    ) : q.is_correct === false ? (
                      <XCircle className="h-5 w-5 text-brand-rose" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                      {q.skill_name && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">{q.skill_name}</span>
                      )}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary capitalize">{q.question_type}</span>
                    </div>
                    <p className="text-sm font-medium line-clamp-1">{q.question_text}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm">{q.score} pts</div>
                    <div className="text-xs text-muted-foreground">{formatTime(q.time_taken_seconds)}</div>
                  </div>
                  {expandedQ === q.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {expandedQ === q.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-border/50 p-5 space-y-4"
                  >
                    {/* Question */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Question</div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{q.question_text}</ReactMarkdown>
                      </div>
                    </div>

                    {/* User Answer */}
                    {(q.user_answer || q.user_code) && (
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Your Answer</div>
                        {q.user_code ? (
                          <pre className="font-mono text-xs bg-secondary/50 rounded-lg p-4 overflow-x-auto">{q.user_code}</pre>
                        ) : (
                          <p className="text-sm text-foreground/80">{q.user_answer}</p>
                        )}
                      </div>
                    )}

                    {/* AI Feedback */}
                    {q.ai_feedback && (
                      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
                        <div className="text-xs font-semibold text-primary uppercase mb-2">AI Feedback</div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{q.ai_feedback}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Expected Answer */}
                    {q.expected_answer && (
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Optimal Answer</div>
                        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                          <ReactMarkdown>{q.expected_answer}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-3"
        >
          <Link to="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <Link to="/interview/select" className="flex-1">
            <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              <RotateCcw className="h-4 w-4 mr-2" /> New Interview
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
