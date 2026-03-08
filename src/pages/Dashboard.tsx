import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Code2, MessageSquare, Brain, Trophy, Clock, Upload, Plus, ChevronRight, Target, TrendingUp, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PreparationModule } from "@/components/PreparationModule";

interface Interview {
  id: string;
  interview_type: string;
  status: string;
  total_score: number;
  max_score: number;
  started_at: string;
  completed_at: string | null;
}

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  coding: { label: "Coding", icon: Code2, color: "text-brand-cyan", bg: "bg-cyan-500/15 border-cyan-500/30" },
  hr: { label: "HR", icon: MessageSquare, color: "text-brand-emerald", bg: "bg-emerald-500/15 border-emerald-500/30" },
  aptitude: { label: "Aptitude", icon: Brain, color: "text-brand-amber", bg: "bg-amber-500/15 border-amber-500/30" },
  combined: { label: "Combined", icon: Target, color: "text-brand-purple", bg: "bg-purple-500/15 border-purple-500/30" },
};

const quickStart = [
  { type: "coding", label: "Coding Interview", icon: Code2, desc: "DSA & algorithms", color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/60" },
  { type: "hr", label: "HR Interview", icon: MessageSquare, desc: "Behavioral questions", color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 hover:border-emerald-500/60" },
  { type: "aptitude", label: "Aptitude Test", icon: Brain, desc: "Logical & verbal", color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 hover:border-amber-500/60" },
  { type: "combined", label: "Full Mock", icon: Target, desc: "All types combined", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 hover:border-purple-500/60" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeCount, setResumeCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [interviewRes, resumeRes] = await Promise.all([
        (supabase as any).from("interviews").select("*").eq("user_id", user.id).order("started_at", { ascending: false }),
        (supabase as any).from("resumes").select("id").eq("user_id", user.id),
      ]);
      if (interviewRes.data) setInterviews(interviewRes.data);
      if (resumeRes.data) setResumeCount(resumeRes.data.length);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const completedInterviews = interviews.filter(i => i.status === "completed");
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((a, b) => a + (b.max_score > 0 ? (b.total_score / b.max_score) * 100 : 0), 0) / completedInterviews.length)
    : 0;

  const handleQuickStart = (type: string) => {
    navigate(`/interview/select?type=${type}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.email?.split("@")[0]}!</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Total Sessions", value: interviews.length, icon: Clock, color: "text-primary" },
            { label: "Completed", value: completedInterviews.length, icon: Trophy, color: "text-brand-emerald" },
            { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-brand-amber" },
            { label: "Resumes", value: resumeCount, icon: Upload, color: "text-brand-cyan" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold">{loading ? "—" : stat.value}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quick Start</h2>
              <Link to="/interview/select">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  All options <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {quickStart.map((qs) => (
                <button
                  key={qs.type}
                  onClick={() => handleQuickStart(qs.type)}
                  className={`w-full text-left glass-card rounded-xl p-4 border bg-gradient-to-r transition-all hover:shadow-glow group ${qs.color}`}
                >
                  <div className="flex items-center gap-3">
                    <qs.icon className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
                    <div>
                      <div className="font-medium text-sm">{qs.label}</div>
                      <div className="text-xs text-muted-foreground">{qs.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}

              <Link to="/resume" className="block">
                <div className="glass-card rounded-xl p-4 border border-dashed border-border/60 hover:border-primary/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div>
                      <div className="font-medium text-sm">Upload Resume</div>
                      <div className="text-xs text-muted-foreground">AI skill extraction</div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Recent Interviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Interviews</h2>
              {interviews.length > 5 && (
                <Link to="/interviews">
                  <Button variant="ghost" size="sm" className="text-primary text-xs">
                    View all ({interviews.length}) <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-muted/50 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted/30 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : interviews.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No interviews yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start your first mock interview to see your progress here.</p>
                <Link to="/interview/select">
                  <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                    Start Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 5).map((interview) => {
                  const config = typeConfig[interview.interview_type] || typeConfig.coding;
                  const scorePercent = interview.max_score > 0
                    ? Math.round((interview.total_score / interview.max_score) * 100)
                    : 0;
                  return (
                    <div
                      key={interview.id}
                      className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => interview.status === "completed" && navigate(`/interview/results/${interview.id}`)}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}>
                        <config.icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.label} Interview</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            interview.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{formatDate(interview.started_at)}</div>
                      </div>
                      {interview.status === "completed" && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${scorePercent >= 70 ? "text-brand-emerald" : scorePercent >= 50 ? "text-brand-amber" : "text-brand-rose"}`}>
                            {scorePercent}%
                          </div>
                          <div className="text-xs text-muted-foreground">{interview.total_score}/{interview.max_score}</div>
                        </div>
                      )}
                      {interview.status === "completed" && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Preparation Resources */}
        <PreparationModule />
      </div>
    </div>
  );
}
