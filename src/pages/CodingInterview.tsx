import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Timer, ChevronLeft, ChevronRight, Play, Loader2, Code2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

// Lazy load Monaco editor
import { lazy, Suspense } from "react";
const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  skill_name: string | null;
  user_code: string | null;
  time_taken_seconds: number | null;
}


const difficultyColors: Record<string, string> = {
  easy: "text-brand-emerald bg-emerald-500/15 border-emerald-500/30",
  medium: "text-brand-amber bg-amber-500/15 border-amber-500/30",
  hard: "text-brand-rose bg-rose-500/15 border-rose-500/30",
};

export default function CodingInterview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("// Write your solution here");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(30 * 60); // 30 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitTriggered = useRef(false);
  // Store code per question so it persists across navigation
  const codeMapRef = useRef<Record<string, string>>({});

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
        // Initialize code map from any previously saved code
        const map: Record<string, string> = {};
        data.forEach((q: Question) => {
          map[q.id] = q.user_code || "// Write your solution here";
        });
        codeMapRef.current = map;
        // Load code for first question
        if (data.length > 0) {
          setCode(data[0].user_code || "// Write your solution here");
        }
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [user, id]);

  // Timer per question
  useEffect(() => {
    setTimer(0);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx]);

  // Total interview timer (30 minutes) with auto-submit
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


  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleRunCode = async () => {
    setRunning(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("execute-code", {
        body: { code, language: "any", questionText: currentQ?.question_text || "" },
      });
      if (error) throw error;
      setOutput(data?.output || data?.stderr || "No output");
    } catch (err: unknown) {
      setOutput(`Error: ${err instanceof Error ? err.message : "Failed to execute code"}`);
    } finally {
      setRunning(false);
    }
  };

  const saveAnswer = useCallback(async (questionId: string, userCode: string, timeTaken: number) => {
    // Save to local map
    codeMapRef.current[questionId] = userCode;
    // Save to DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("interview_questions")
      .update({ user_code: userCode, time_taken_seconds: timeTaken })
      .eq("id", questionId);
  }, []);

  const handleNext = async () => {
    if (!questions[currentIdx]) return;
    // Save current code before navigating
    codeMapRef.current[questions[currentIdx].id] = code;
    await saveAnswer(questions[currentIdx].id, code, timer);
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      // Load saved code for next question
      setCode(codeMapRef.current[questions[nextIdx].id] || "// Write your solution here");
      setOutput("");
    }
  };

  const handlePrev = async () => {
    if (!questions[currentIdx]) return;
    // Save current code before navigating
    codeMapRef.current[questions[currentIdx].id] = code;
    await saveAnswer(questions[currentIdx].id, code, timer);
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      // Load saved code for previous question
      setCode(codeMapRef.current[questions[prevIdx].id] || "// Write your solution here");
      setOutput("");
    }
  };

  const handleSubmit = async () => {
    if (!questions[currentIdx] || !id) return;
    setSubmitting(true);
    await saveAnswer(questions[currentIdx].id, code, timer);

    // Mark interview complete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("interviews").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", id);

    navigate(`/interview/results/${id}`);
  };

  const currentQ = questions[currentIdx];

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
        <p className="text-muted-foreground">No questions found for this interview.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Navbar />

      {/* Header bar */}
      <div className="pt-16 flex-shrink-0">
        <div className="glass border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">Coding Interview</span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-colors ${i === currentIdx ? "bg-primary" : i < currentIdx ? "bg-primary/40" : "bg-secondary"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className={`font-mono ${totalTimer <= 60 ? "text-destructive" : totalTimer <= 300 ? "text-yellow-500" : "text-foreground"}`}>
                  {formatTime(totalTimer)}
                </span>
                <span className="text-xs text-muted-foreground">remaining</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      <button id="auto-submit-trigger" onClick={handleSubmit} className="hidden" />

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question */}
        <div className="w-2/5 flex flex-col border-r border-border/50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[currentQ?.difficulty] || difficultyColors.medium}`}>
                {currentQ?.difficulty}
              </span>
              {currentQ?.skill_name && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border/60">
                  {currentQ.skill_name}
                </span>
              )}
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{currentQ?.question_text || ""}</ReactMarkdown>
            </div>
          </div>

          {/* Output */}
          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-4 mb-4 rounded-xl bg-secondary/50 border border-border/60 p-4"
            >
              <div className="text-xs font-semibold text-muted-foreground mb-2">OUTPUT</div>
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">{output}</pre>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-auto p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIdx === 0} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              {currentIdx < questions.length - 1 ? (
                <Button size="sm" onClick={handleNext} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmit} disabled={submitting} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Submit</>}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor header */}
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 bg-secondary/30">
            <div className="text-sm text-muted-foreground">
              Write the solution here; AI will evaluate it
            </div>

            <Button size="sm" onClick={handleRunCode} disabled={running} className="h-8 bg-gradient-primary text-primary-foreground hover:opacity-90">
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
              Run
            </Button>
          </div>

          <Suspense fallback={<div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <MonacoEditor
              height="100%"
              language="plaintext"
              value={code}
              onChange={(v) => {
                const newCode = v || "";
                setCode(newCode);
                if (currentQ) codeMapRef.current[currentQ.id] = newCode;
              }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                tabSize: 2,
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
