import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle2, Code2, Lightbulb, FileCode2, PenTool, BarChart3 } from "lucide-react";
import { LessonQuiz } from "@/components/LessonQuiz";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { preparationCourses, type Topic, type Lesson } from "@/data/preparationCourses";
import { quizData } from "@/data/quizData";
import { Progress } from "@/components/ui/progress";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCode2, Lightbulb, PenTool, BarChart3,
};

const difficultyColor: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-500/15",
  Medium: "text-amber-400 bg-amber-500/15",
  Hard: "text-rose-400 bg-rose-500/15",
};

// Helper to get/set completed lessons from localStorage
function getCompletedLessons(categoryId: string, topicId: string): Set<number> {
  try {
    const key = `prep_completed_${categoryId}_${topicId}`;
    const data = localStorage.getItem(key);
    if (data) return new Set(JSON.parse(data));
  } catch {}
  return new Set();
}

function saveCompletedLessons(categoryId: string, topicId: string, completed: Set<number>) {
  const key = `prep_completed_${categoryId}_${topicId}`;
  localStorage.setItem(key, JSON.stringify([...completed]));
}

function getTopicCompletionCount(categoryId: string, topicId: string, totalLessons: number): number {
  const completed = getCompletedLessons(categoryId, topicId);
  return completed.size;
}

export default function PreparationCourse() {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();

  const category = preparationCourses.find(c => c.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const IconComp = iconMap[category.icon] || BookOpen;

  // If topicId is provided, show the topic detail view
  if (topicId) {
    const topic = category.topics.find(t => t.id === topicId);
    if (!topic) {
      return (
        <div className="min-h-screen bg-background pt-16">
          <Navbar />
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
            <Link to={`/preparation/${categoryId}`}><Button>Back to {category.category}</Button></Link>
          </div>
        </div>
      );
    }
    return <TopicDetail category={category} topic={topic} categoryId={categoryId!} />;
  }

  // Category overview — list of topics with completion status
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => navigate("/preparation")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Preparation
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${category.iconBg}`}>
              <IconComp className={`h-7 w-7 ${category.iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.category}</h1>
              <p className="text-muted-foreground">{category.topics.length} topics · Start learning at your own pace</p>
            </div>
          </div>

          <div className="space-y-4">
            {category.topics.map((topic, i) => {
              const completedCount = getTopicCompletionCount(categoryId!, topic.id, topic.lessons.length);
              const totalLessons = topic.lessons.length;
              const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
              const isComplete = completedCount === totalLessons && totalLessons > 0;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    onClick={() => navigate(`/preparation/${categoryId}/${topic.id}`)}
                    className={`w-full text-left rounded-2xl border bg-gradient-to-br p-6 transition-all hover:shadow-glow group ${category.color} ${category.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-brand-emerald shrink-0" />
                          ) : null}
                          <span className="text-lg font-semibold">{topic.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColor[topic.difficulty]}`}>
                            {topic.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{topic.desc}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {completedCount}/{totalLessons} concepts
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TopicDetail({ category, topic, categoryId }: { category: typeof preparationCourses[0]; topic: Topic; categoryId: string }) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(() => getCompletedLessons(categoryId, topic.id));
  const navigate = useNavigate();

  const markComplete = (idx: number) => {
    setCompletedLessons(prev => {
      const next = new Set(prev).add(idx);
      saveCompletedLessons(categoryId, topic.id, next);
      return next;
    });
  };

  const progress = Math.round((completedLessons.size / topic.lessons.length) * 100);

  // Concept list view
  if (selectedLesson === null) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => navigate(`/preparation/${categoryId}`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to {category.category}
            </Button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{topic.title}</h1>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColor[topic.difficulty]}`}>
                  {topic.difficulty}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{topic.desc}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                </div>
                <span className="text-xs text-muted-foreground">{completedLessons.size}/{topic.lessons.length} complete</span>
              </div>
            </div>

            <div className="space-y-4">
              {topic.lessons.map((lesson, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    onClick={() => setSelectedLesson(i)}
                    className={`w-full text-left rounded-2xl border bg-gradient-to-br p-6 transition-all hover:shadow-glow group ${category.color} ${category.border}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          {completedLessons.has(i) ? (
                            <CheckCircle2 className="h-5 w-5 text-brand-emerald shrink-0" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}
                          <span className="text-lg font-semibold">{lesson.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">{lesson.keyPoints[0]}</p>
                        <div className="flex items-center gap-3 mt-2 ml-8 text-xs text-muted-foreground/70">
                          {lesson.quiz && <span>{lesson.quiz.length} quiz questions</span>}
                          {lesson.example && <span>• Code example</span>}
                          {lesson.realWorldScenario && <span>• Real-world scenario</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Concept detail view
  const lesson = topic.lessons[selectedLesson];

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => setSelectedLesson(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to {topic.title}
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{topic.title} · Concept {selectedLesson + 1} of {topic.lessons.length}</p>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <p className="text-muted-foreground leading-relaxed">{lesson.content}</p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-border/50">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Key Points
              </h3>
              <ul className="space-y-2">
                {lesson.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {lesson.example && (
              <div className="glass-card rounded-2xl p-6 border border-border/50">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4" /> Example
                </h3>
                <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
                  <code className="text-muted-foreground font-mono">{lesson.example}</code>
                </pre>
              </div>
            )}

            {lesson.realWorldScenario && (
              <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  🌍 Real-World Applications
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{lesson.realWorldScenario}</p>
              </div>
            )}

            {(() => {
              const quizQuestions = lesson.quiz ?? quizData[categoryId]?.[topic.id]?.[selectedLesson];
              return quizQuestions && quizQuestions.length > 0 ? (
                <LessonQuiz key={`quiz-${selectedLesson}`} questions={quizQuestions} />
              ) : null;
            })()}

            <div className="flex items-center gap-3">
              <Button
                onClick={() => markComplete(selectedLesson)}
                className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                disabled={completedLessons.has(selectedLesson)}
              >
                {completedLessons.has(selectedLesson) ? (
                  <><CheckCircle2 className="h-4 w-4 mr-1" /> Completed</>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
              {selectedLesson < topic.lessons.length - 1 && (
                <Button variant="ghost" onClick={() => setSelectedLesson(selectedLesson + 1)}>
                  Next Concept <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
