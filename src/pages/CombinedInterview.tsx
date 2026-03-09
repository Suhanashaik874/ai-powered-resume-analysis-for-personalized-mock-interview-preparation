import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Timer, ChevronLeft, ChevronRight, Play, Loader2, Send, Target,
  Mic, MicOff, CheckCircle2, Code2, MessageSquare, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  skill_name: string | null;
  options: Record<string, string> | null;
  expected_answer: string | null;
  user_answer: string | null;
  user_code: string | null;
  time_taken_seconds: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAPI = any;


const difficultyColors: Record<string, string> = {
  easy: "text-brand-emerald bg-emerald-500/15 border-emerald-500/30",
  medium: "text-brand-amber bg-amber-500/15 border-amber-500/30",
  hard: "text-brand-rose bg-rose-500/15 border-rose-500/30",
};

const typeIcons: Record<string, { icon: typeof Code2; label: string; color: string }> = {
  coding: { icon: Code2, label: "Coding", color: "text-brand-cyan" },
  hr: { icon: MessageSquare, label: "HR", color: "text-brand-emerald" },
  aptitude: { icon: Brain, label: "Aptitude", color: "text-brand-amber" },
};

export default function CombinedInterview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(45 * 60); // 45 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSubmitTriggered = useRef(false);

  // Coding state
  const [code, setCode] = useState("// Write your solution here");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const codeMapRef = useRef<Record<string, string>>({});

  // HR state
  const [hrAnswer, setHrAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionAPI>(null);
  const baseTextRef = useRef("");
  const finalTranscriptRef = useRef("");

  // Aptitude state
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
        const cMap: Record<string, string> = {};
        const aMap: Record<string, string> = {};
        data.forEach((q: Question) => {
          if (q.question_type === "coding") {
            cMap[q.id] = q.user_code || "// Write your solution here";
          }
          if (q.user_answer) aMap[q.id] = q.user_answer;
        });
        codeMapRef.current = cMap;
        setAnswers(aMap);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [user, id]);

  // Load state when question changes
  useEffect(() => {
    const q = questions[currentIdx];
    if (!q) return;
    setTimer(0);
    setOutput("");
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);

    if (q.question_type === "coding") {
      setCode(codeMapRef.current[q.id] || "// Write your solution here");
    } else if (q.question_type === "hr") {
      setHrAnswer(q.user_answer || answers[q.id] || "");
      baseTextRef.current = "";
      finalTranscriptRef.current = "";
    } else if (q.question_type === "aptitude") {
      setSelectedOption(answers[q.id] || "");
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx, questions]);

  // Total interview timer (45 minutes) with auto-submit
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

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const currentQ = questions[currentIdx];
  const qType = currentQ?.question_type || "coding";
  const TypeInfo = typeIcons[qType] || typeIcons.coding;

  // --- Save helpers ---
  const saveCurrentAnswer = useCallback(async () => {
    const q = questions[currentIdx];
    if (!q) return;
    if (q.question_type === "coding") {
      codeMapRef.current[q.id] = code;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("interview_questions")
        .update({ user_code: code, time_taken_seconds: timer }).eq("id", q.id);
    } else if (q.question_type === "hr") {
      setAnswers(prev => ({ ...prev, [q.id]: hrAnswer }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("interview_questions")
        .update({ user_answer: hrAnswer, time_taken_seconds: timer }).eq("id", q.id);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("interview_questions")
        .update({ user_answer: selectedOption, time_taken_seconds: timer }).eq("id", q.id);
    }
  }, [currentIdx, questions, code, hrAnswer, selectedOption, timer]);

  // --- Navigation ---
  const handleNav = async (direction: number) => {
    await saveCurrentAnswer();
    const nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < questions.length) setCurrentIdx(nextIdx);
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    await saveCurrentAnswer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("interviews").update({
      status: "completed", completed_at: new Date().toISOString(),
    }).eq("id", id);
    navigate(`/interview/results/${id}`);
  };

  // --- Coding: run code ---
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

  // --- HR: voice ---
  const toggleSpeech = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast({ title: "Speech not supported", variant: "destructive" });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      baseTextRef.current = baseTextRef.current + finalTranscriptRef.current;
      finalTranscriptRef.current = "";
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    baseTextRef.current = hrAnswer;
    finalTranscriptRef.current = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "", finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      finalTranscriptRef.current = finalText;
      setHrAnswer(baseTextRef.current + finalText + interim);
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => {
      setListening(false);
      baseTextRef.current = baseTextRef.current + finalTranscriptRef.current;
      finalTranscriptRef.current = "";
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // --- Aptitude: select ---
  const handleSelectOption = (key: string) => {
    setSelectedOption(key);
    const q = questions[currentIdx];
    if (q) setAnswers(prev => ({ ...prev, [q.id]: key }));
  };

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
        <p className="text-muted-foreground">No questions found.</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  // For coding questions, use split layout
  if (qType === "coding") {
    return (
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        <Navbar />
        <div className="pt-16 flex-shrink-0">
          <HeaderBar questions={questions} currentIdx={currentIdx} totalTimer={totalTimer} formatTime={formatTime} TypeInfo={TypeInfo} qType={qType} />
        </div>
        <button id="auto-submit-trigger" onClick={handleSubmit} className="hidden" />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Question */}
          <div className="w-2/5 flex flex-col border-r border-border/50 overflow-y-auto">
            <div className="p-6">
              <QuestionMeta currentQ={currentQ} />
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{currentQ?.question_text || ""}</ReactMarkdown>
              </div>
            </div>
            {output && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mb-4 rounded-xl bg-secondary/50 border border-border/60 p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">OUTPUT</div>
                <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">{output}</pre>
              </motion.div>
            )}
            <div className="mt-auto p-4 border-t border-border/50">
              <NavButtons currentIdx={currentIdx} total={questions.length} onPrev={() => handleNav(-1)} onNext={() => handleNav(1)} onSubmit={handleSubmit} submitting={submitting} />
            </div>
          </div>
          {/* Right: Editor */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 bg-secondary/30">
              <div className="text-sm text-muted-foreground">
                Write the solution here; AI will evaluate it
              </div>
              <Button size="sm" onClick={handleRunCode} disabled={running} className="h-8 bg-gradient-primary text-primary-foreground hover:opacity-90">
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />} Run
              </Button>
            </div>
            <Suspense fallback={<div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
              <MonacoEditor
                height="100%"
                language="plaintext"
                value={code}
                onChange={(v) => { const c = v || ""; setCode(c); if (currentQ) codeMapRef.current[currentQ.id] = c; }}
                theme="vs-dark"
                options={{ fontSize: 14, fontFamily: "JetBrains Mono, monospace", minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 }, tabSize: 2 }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }

  // For HR and Aptitude, use single-column layout
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <HeaderBar questions={questions} currentIdx={currentIdx} totalTimer={totalTimer} formatTime={formatTime} TypeInfo={TypeInfo} qType={qType} />

        <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-8 mb-6 mt-6">
          <QuestionMeta currentQ={currentQ} />

          <div className="prose prose-invert max-w-none text-lg mb-8">
            <ReactMarkdown>{currentQ?.question_text || ""}</ReactMarkdown>
          </div>

          {/* Aptitude: MCQ */}
          {qType === "aptitude" && currentQ?.options && Object.keys(currentQ.options).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(currentQ.options as Record<string, string>).map(([key, value]) => (
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
                    selectedOption === key ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-muted-foreground"
                  }`}>
                    {selectedOption === key ? <CheckCircle2 className="h-4 w-4" /> : key}
                  </div>
                  <span className="text-sm">{value}</span>
                </button>
              ))}
            </div>
          ) : qType === "hr" ? (
            /* HR: Textarea + Voice */
            <div>
              <div className="relative">
                <Textarea
                  value={hrAnswer}
                  onChange={(e) => setHrAnswer(e.target.value)}
                  placeholder="Type your answer here, or use the microphone for voice input..."
                  className="min-h-40 bg-secondary/50 border-border/60 text-sm resize-none pr-12"
                />
                <button
                  onClick={toggleSpeech}
                  className={`absolute bottom-3 right-3 rounded-lg p-2 transition-colors ${
                    listening ? "bg-destructive/20 text-destructive animate-pulse" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  title={listening ? "Stop listening" : "Start voice input"}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              {listening && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex items-center gap-2 text-xs text-destructive">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-ping" />
                  Listening... speak clearly
                </motion.div>
              )}
              <div className="mt-2 text-xs text-muted-foreground text-right">
                {hrAnswer.split(" ").filter(Boolean).length} words
              </div>
            </div>
          ) : null}
        </motion.div>

        <NavButtons currentIdx={currentIdx} total={questions.length} onPrev={() => handleNav(-1)} onNext={() => handleNav(1)} onSubmit={handleSubmit} submitting={submitting} />

        {/* Question navigator */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((q, i) => {
            const answered = q.question_type === "coding" ? !!codeMapRef.current[q.id] : !!answers[q.id];
            const tInfo = typeIcons[q.question_type] || typeIcons.coding;
            return (
              <button
                key={q.id}
                onClick={async () => { await saveCurrentAnswer(); setCurrentIdx(i); }}
                className={`h-8 w-8 rounded-lg text-xs font-medium transition-all relative ${
                  i === currentIdx ? "bg-primary text-primary-foreground" : answered ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground border border-border/60"
                }`}
                title={`Q${i + 1} (${tInfo.label})`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function HeaderBar({ questions, currentIdx, totalTimer, formatTime, TypeInfo, qType }: {
  questions: Question[]; currentIdx: number; totalTimer: number; formatTime: (s: number) => string;
  TypeInfo: { icon: typeof Code2; label: string; color: string }; qType: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30">
          <Target className="h-4 w-4 text-brand-purple" />
        </div>
        <span className="font-semibold">Full Mock Interview</span>
        <div className="flex gap-1 ml-2">
          {questions.map((q, i) => {
            const tColors: Record<string, string> = { coding: "bg-cyan-400", hr: "bg-emerald-400", aptitude: "bg-amber-400" };
            return (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIdx ? `w-6 ${tColors[q.question_type] || "bg-primary"}` : `w-3 ${i < currentIdx ? "bg-primary/40" : "bg-secondary"}`
                }`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${
          qType === "coding" ? "border-cyan-500/30 bg-cyan-500/10 text-brand-cyan" :
          qType === "hr" ? "border-emerald-500/30 bg-emerald-500/10 text-brand-emerald" :
          "border-amber-500/30 bg-amber-500/10 text-brand-amber"
        }`}>
          <TypeInfo.icon className="h-3 w-3" /> {TypeInfo.label}
        </span>
        <div className="flex items-center gap-1.5 text-sm">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className={`font-mono font-medium ${totalTimer <= 60 ? "text-destructive" : totalTimer <= 300 ? "text-yellow-500" : "text-foreground"}`}>{formatTime(totalTimer)}</span>
          <span className="text-xs text-muted-foreground">remaining</span>
        </div>
        <span className="text-sm text-muted-foreground">{currentIdx + 1}/{questions.length}</span>
      </div>
    </motion.div>
  );
}

function QuestionMeta({ currentQ }: { currentQ: Question | undefined }) {
  if (!currentQ) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[currentQ.difficulty] || difficultyColors.medium}`}>
        {currentQ.difficulty}
      </span>
      {currentQ.skill_name && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border/60">{currentQ.skill_name}</span>
      )}
    </div>
  );
}

function NavButtons({ currentIdx, total, onPrev, onNext, onSubmit, submitting }: {
  currentIdx: number; total: number; onPrev: () => void; onNext: () => void; onSubmit: () => void; submitting: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onPrev} disabled={currentIdx === 0} className="flex-1">
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      {currentIdx < total - 1 ? (
        <Button onClick={onNext} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={submitting} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
          Submit Interview
        </Button>
      )}
    </div>
  );
}
