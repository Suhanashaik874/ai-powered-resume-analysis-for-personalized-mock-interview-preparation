import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, ChevronRight, Loader2, Wrench, Lightbulb, Code2, Target, Briefcase, AlertCircle, ThumbsUp, ThumbsDown, Link2 } from "lucide-react";

// Safely convert any value to a renderable string
const toStr = (val: unknown): string => {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(" — ");
  return String(val ?? "");
};
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ExtractedSkill {
  id: string;
  skill_name: string;
  proficiency_level: string;
}

interface SkillSummary {
  title: string;
  summary: string;
  proficiencyNote?: string;
  keyConcepts: string[];
  commonUseCases: string[];
  interviewTips: string[];
  codeExample: string;
  realWorldExample: string;
  prosAndCons?: { type: "pro" | "con"; text: string }[];
  relatedTechnologies?: string[];
  architectureFlow?: string;
}

const proficiencyColors: Record<string, string> = {
  beginner: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  intermediate: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  advanced: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  expert: "text-purple-400 bg-purple-500/15 border-purple-500/30",
};

export default function SkillRevision() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<ExtractedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<ExtractedSkill | null>(null);
  const [summaryData, setSummaryData] = useState<SkillSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCache, setSummaryCache] = useState<Record<string, SkillSummary>>({});

  useEffect(() => {
    if (!user) return;
    const fetchSkills = async () => {
      const { data } = await (supabase as any)
        .from("extracted_skills")
        .select("id, skill_name, proficiency_level")
        .eq("user_id", user.id)
        .order("skill_name");
      setSkills(data || []);
      setLoading(false);
    };
    fetchSkills();
  }, [user]);

  const handleSkillClick = async (skill: ExtractedSkill) => {
    setSelectedSkill(skill);

    // Check cache first
    if (summaryCache[skill.id]) {
      setSummaryData(summaryCache[skill.id]);
      return;
    }

    setSummaryData(null);
    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skill-summary", {
        body: { skillName: skill.skill_name, proficiencyLevel: skill.proficiency_level },
      });
      if (error) throw error;
      setSummaryData(data);
      setSummaryCache(prev => ({ ...prev, [skill.id]: data }));
    } catch {
      setSummaryData({
        title: skill.skill_name,
        summary: "Failed to generate summary. Please try again.",
        keyConcepts: [],
        commonUseCases: [],
        interviewTips: [],
        codeExample: "",
        realWorldExample: "",
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => navigate("/preparation")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Preparation
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border-indigo-500/30">
              <Brain className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Revise Your Skills</h1>
              <p className="text-muted-foreground">
                {skills.length > 0
                  ? `${skills.length} skills extracted from your resume — click any to revise`
                  : "Upload a resume first to extract your skills"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : skills.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No skills found</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload your resume first so we can extract your skills for revision.</p>
              <Link to="/resume">
                <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  Upload Resume
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Skills List */}
              <div className="space-y-2">
                {skills.map((skill, i) => (
                  <motion.button
                    key={skill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSkillClick(skill)}
                    className={`w-full text-left rounded-xl px-4 py-3 border transition-all text-sm ${
                      selectedSkill?.id === skill.id
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border/40 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{skill.skill_name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${proficiencyColors[skill.proficiency_level] || proficiencyColors.beginner}`}>
                        {skill.proficiency_level}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Skill Summary Content */}
              <div>
                {!selectedSkill ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a skill from the left to view its revision summary</p>
                  </div>
                ) : summaryLoading ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="relative mx-auto mb-6 h-16 w-16">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Brain className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Generating Summary...</h3>
                    <p className="text-muted-foreground text-sm">Creating a revision guide for {selectedSkill.skill_name}</p>
                    <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : summaryData ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedSkill.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Proficiency Note */}
                      {summaryData.proficiencyNote && (
                        <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary flex items-center gap-2">
                          <Brain className="h-4 w-4 shrink-0" />
                          {summaryData.proficiencyNote}
                        </div>
                      )}

                      {/* Overview */}
                      <div className="glass-card rounded-2xl p-6 border border-border/50">
                        <h2 className="text-xl font-bold mb-3">{summaryData.title}</h2>
                        <p className="text-muted-foreground leading-relaxed">{summaryData.summary}</p>
                      </div>

                      {/* Key Concepts */}
                      {summaryData.keyConcepts?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 border border-border/50">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Key Concepts
                          </h3>
                          <ul className="space-y-2">
                            {summaryData.keyConcepts.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{toStr(c)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Common Use Cases */}
                      {summaryData.commonUseCases?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 border border-border/50">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Common Use Cases
                          </h3>
                          <ul className="space-y-2">
                            {summaryData.commonUseCases.map((u, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{toStr(u)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Code Example */}
                      {summaryData.codeExample && (
                        <div className="glass-card rounded-2xl p-6 border border-border/50">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Code Example
                          </h3>
                          <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
                            <code className="text-muted-foreground font-mono">{summaryData.codeExample}</code>
                          </pre>
                        </div>
                      )}

                      {/* Interview Tips */}
                      {summaryData.interviewTips?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Interview Tips
                          </h3>
                          <ul className="space-y-2">
                            {summaryData.interviewTips.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{toStr(t)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pros and Cons */}
                      {summaryData.prosAndCons?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 border border-border/50">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            Pros & Cons
                          </h3>
                          <div className="space-y-2">
                            {summaryData.prosAndCons.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                {item.type === "pro" ? (
                                  <ThumbsUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <ThumbsDown className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <span>{toStr(item.text)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Real World Example */}
                      {summaryData.realWorldExample && (
                        <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            🌍 Real-World Application
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{summaryData.realWorldExample}</p>
                        </div>
                      )}

                      {/* Architecture Flow (Expert only) */}
                      {summaryData.architectureFlow && (
                        <div className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            🏗️ Architecture Flow
                          </h3>
                          <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap">
                            <code className="text-muted-foreground font-mono">{summaryData.architectureFlow}</code>
                          </pre>
                        </div>
                      )}

                      {/* Related Technologies */}
                      {summaryData.relatedTechnologies?.length > 0 && (
                        <div className="glass-card rounded-2xl p-6 border border-border/50">
                          <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Related Technologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {summaryData.relatedTechnologies.map((tech, i) => (
                              <span key={i} className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                                {toStr(tech)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
