import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/data/preparationCourses";

interface LessonQuizProps {
  questions: QuizQuestion[];
}

export function LessonQuiz({ questions }: LessonQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const q = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setAnswered(true);
    const correct = selected === q.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setAnswers((a) => [...a, selected]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 border border-border/50 text-center"
      >
        <Trophy className={`h-12 w-12 mx-auto mb-3 ${pct >= 70 ? "text-amber-400" : "text-muted-foreground"}`} />
        <h3 className="text-xl font-bold mb-1">Quiz Complete!</h3>
        <p className="text-3xl font-bold text-primary mb-1">{score}/{questions.length}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {pct >= 90 ? "Outstanding! You've mastered this topic!" : pct >= 70 ? "Great job! You have a solid understanding." : pct >= 50 ? "Good effort! Review the key points and try again." : "Keep learning! Review the lesson content and retry."}
        </p>

        {/* Answer Review */}
        <div className="text-left space-y-2 mb-4">
          {questions.map((question, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              {answers[i] === question.correctAnswer ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="text-muted-foreground truncate">{question.question}</span>
            </div>
          ))}
        </div>

        <Button onClick={handleRetry} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-1" /> Retry Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Quick Quiz
        </h3>
        <span className="text-xs text-muted-foreground">
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentQ
                ? answers[i] === questions[i].correctAnswer
                  ? "bg-emerald-400"
                  : "bg-rose-400"
                : i === currentQ
                ? "bg-primary"
                : "bg-muted/50"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-medium mb-4">{q.question}</p>

          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              let style = "border-border/40 bg-card/50 hover:bg-card hover:border-border";
              if (answered) {
                if (i === q.correctAnswer) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                else if (i === selected && i !== q.correctAnswer) style = "border-rose-500/50 bg-rose-500/10 text-rose-300";
                else style = "border-border/20 bg-card/30 text-muted-foreground/50";
              } else if (i === selected) {
                style = "border-primary/50 bg-primary/10 text-foreground";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`w-full text-left rounded-xl px-4 py-3 border transition-all text-sm ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 border-current">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-3 mb-4 text-sm ${
                selected === q.correctAnswer
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              <p className="font-medium mb-1">
                {selected === q.correctAnswer ? "✓ Correct!" : `✗ Incorrect — Answer: ${String.fromCharCode(65 + q.correctAnswer)}`}
              </p>
              <p className="text-muted-foreground text-xs">{q.explanation}</p>
            </motion.div>
          )}

          <div className="flex gap-2">
            {!answered ? (
              <Button
                onClick={handleSubmit}
                disabled={selected === null}
                size="sm"
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                Check Answer
              </Button>
            ) : (
              <Button onClick={handleNext} size="sm">
                {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
