import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Timer, ChevronLeft, ChevronRight, Mic, MicOff, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  time_taken_seconds: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAPI = any;

export default function HRInterview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [totalTimer, setTotalTimer] = useState(20 * 60); // 20 minutes in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionAPI>(null);
  const baseTextRef = useRef("");
  const finalTranscriptRef = useRef("");
  const autoSubmitTriggered = useRef(false);

  useEffect(() => {
    if (!user || !id) return;
    const fetchQuestions = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("interview_questions")
        .select("*")
        .eq("interview_id", id)
        .order("created_at", { ascending: true });
      if (data) setQuestions(data);
      setLoading(false);
    };
    fetchQuestions();
  }, [user, id]);

  // Total interview timer (20 minutes auto-submit)
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTimer((t) => {
        if (t <= 1 && !autoSubmitTriggered.current) {
          autoSubmitTriggered.current = true;
          // Auto-submit when time runs out
          setTimeout(() => {
            const submitBtn = document.getElementById("auto-submit-trigger");
            if (submitBtn) submitBtn.click();
          }, 100);
          return 0;
        }
        return t > 0 ? t - 1 : 0;
      });
    }, 1000);
    return () => { if (totalTimerRef.current) clearInterval(totalTimerRef.current); };
  }, []);

  // Load saved answer when changing question
  useEffect(() => {
    if (questions.length > 0 && questions[currentIdx]) {
      setAnswer(questions[currentIdx].user_answer || "");
    } else {
      setAnswer("");
    }
    setTimer(0);
    baseTextRef.current = "";
    finalTranscriptRef.current = "";
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIdx, questions]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const toggleSpeech = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      toast({ title: "Speech not supported", description: "Your browser doesn't support speech recognition.", variant: "destructive" });
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      // Commit final transcript to base
      baseTextRef.current = baseTextRef.current + finalTranscriptRef.current;
      finalTranscriptRef.current = "";
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Capture the current text as the base before speech starts
    baseTextRef.current = answer;
    finalTranscriptRef.current = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = finalText;
      setAnswer(baseTextRef.current + finalText + interim);
    };

    recognition.onerror = () => {
      setListening(false);
      toast({ title: "Speech error", description: "Could not capture speech.", variant: "destructive" });
    };

    recognition.onend = () => {
      setListening(false);
      baseTextRef.current = baseTextRef.current + finalTranscriptRef.current;
      finalTranscriptRef.current = "";
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const saveAnswer = useCallback(async (questionId: string, userAnswer: string, timeTaken: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("interview_questions")
      .update({ user_answer: userAnswer, time_taken_seconds: timeTaken })
      .eq("id", questionId);
  }, []);

  const handleNext = async () => {
    if (!questions[currentIdx]) return;
    await saveAnswer(questions[currentIdx].id, answer, timer);
    setQuestions(prev => prev.map((q, i) => i === currentIdx ? { ...q, user_answer: answer, time_taken_seconds: timer } : q));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = async () => {
    if (!questions[currentIdx]) return;
    await saveAnswer(questions[currentIdx].id, answer, timer);
    setQuestions(prev => prev.map((q, i) => i === currentIdx ? { ...q, user_answer: answer, time_taken_seconds: timer } : q));
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);

    // Update current question's answer in local state
    const currentQ = questions[currentIdx];
    const updatedQuestions = questions.map((q, i) =>
      i === currentIdx ? { ...q, user_answer: answer } : q
    );

    // Bulk-save ALL answers to DB before completing
    const savePromises = updatedQuestions.map((q) => {
      const userAnswer = q.user_answer || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (supabase as any)
        .from("interview_questions")
        .update({ user_answer: userAnswer })
        .eq("id", q.id);
    });
    await Promise.all(savePromises);

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
        <p className="text-muted-foreground">No questions found.</p>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              <MessageSquare className="h-4 w-4 text-brand-emerald" />
            </div>
            <span className="font-semibold">HR Interview</span>
            <div className="flex gap-1 ml-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === currentIdx ? "w-6 bg-primary" : i < currentIdx ? "w-3 bg-primary/40" : "w-3 bg-secondary"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {/* Total Time Remaining */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${totalTimer <= 60 ? "bg-destructive/15 text-destructive" : totalTimer <= 300 ? "bg-yellow-500/15 text-yellow-500" : "bg-secondary"}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono font-semibold">{formatTime(totalTimer)}</span>
              <span className="text-xs text-muted-foreground">left</span>
            </div>
            {/* Question Timer */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Q:</span>
              <span className={`font-mono font-medium ${timer > 180 ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timer)}
              </span>
            </div>
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
            <span className="text-sm text-muted-foreground">Question {currentIdx + 1} of {questions.length}</span>
            {currentQ?.skill_name && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border/60">
                {currentQ.skill_name}
              </span>
            )}
          </div>

          <div className="prose prose-invert max-w-none text-lg mb-8">
            <ReactMarkdown>{currentQ?.question_text || ""}</ReactMarkdown>
          </div>

          {/* Answer area */}
          <div className="relative">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here, or use the microphone for voice input..."
              className="min-h-40 bg-secondary/50 border-border/60 text-sm resize-none pr-12"
            />
            <button
              onClick={toggleSpeech}
              className={`absolute bottom-3 right-3 rounded-lg p-2 transition-colors ${
                listening
                  ? "bg-destructive/20 text-destructive animate-pulse"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              title={listening ? "Stop listening" : "Start voice input"}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {listening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center gap-2 text-xs text-destructive"
            >
              <div className="h-2 w-2 rounded-full bg-destructive animate-ping" />
              Listening... speak clearly
            </motion.div>
          )}

          <div className="mt-2 text-xs text-muted-foreground text-right">
            {answer.split(" ").filter(Boolean).length} words
          </div>
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
              Submit Interview
            </Button>
          )}
        </div>
        
        {/* Hidden auto-submit trigger for 20-minute timeout */}
        <button id="auto-submit-trigger" onClick={handleSubmit} className="hidden" />
      </div>
    </div>
  );
}
