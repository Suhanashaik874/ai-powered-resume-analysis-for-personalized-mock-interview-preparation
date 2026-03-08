import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, MessageSquare, Brain, Target, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

export default function AllInterviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("interviews")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });
      if (data) setInterviews(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            All Interviews
            <span className="text-sm font-normal text-muted-foreground ml-2">({interviews.length})</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted/30 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
            {interviews.map((interview, i) => {
              const config = typeConfig[interview.interview_type] || typeConfig.coding;
              const scorePercent = interview.max_score > 0
                ? Math.round((interview.total_score / interview.max_score) * 100)
                : 0;
              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
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
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
