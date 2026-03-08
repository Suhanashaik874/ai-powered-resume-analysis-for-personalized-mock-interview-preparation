import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Brain, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Skill {
  skill_name: string;
  proficiency_level: string;
}

interface SavedResume {
  id: string;
  file_name: string;
  created_at: string;
  skills: Skill[];
}

const proficiencyColors: Record<string, string> = {
  beginner: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  expert: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ("str" in item ? (item.str as string) : ""))
      .join(" ") + "\n";
  }
  return text;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export default function Resume() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [step, setStep] = useState<"idle" | "extracting" | "analyzing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch previously uploaded resumes and their skills
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data: resumes } = await (supabase as any)
        .from("resumes")
        .select("id, file_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!resumes?.length) {
        setLoadingHistory(false);
        return;
      }

      const resumeIds = resumes.map((r: any) => r.id);
      const { data: allSkills } = await (supabase as any)
        .from("extracted_skills")
        .select("resume_id, skill_name, proficiency_level")
        .in("resume_id", resumeIds);

      const mapped: SavedResume[] = resumes.map((r: any) => ({
        ...r,
        skills: (allSkills || []).filter((s: any) => s.resume_id === r.id),
      }));
      setSavedResumes(mapped);
      setLoadingHistory(false);
    };
    fetchHistory();
  }, [user]);

  const handleFile = useCallback(async (f: File) => {
    if (!user) return;
    setFile(f);
    setStep("extracting");
    setSkills([]);
    setErrorMsg("");

    try {
      let text = "";
      if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
        text = await extractTextFromPDF(f);
      } else if (f.name.endsWith(".docx") || f.name.endsWith(".doc")) {
        text = await extractTextFromDOCX(f);
      } else {
        throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
      }

      const { data: resumeData, error: resumeError } = await (supabase as any).from("resumes").insert({
        user_id: user.id,
        file_name: f.name,
        raw_text: text,
      }).select().single();

      if (resumeError) throw resumeError;
      const resumeId = (resumeData as { id: string })?.id;

      setStep("analyzing");
      const { data, error } = await supabase.functions.invoke("extract-skills", {
        body: { resumeText: text, resumeId, userId: user.id },
      });
      if (error) throw error;

      const extractedSkills: Skill[] = data?.skills || [];
      setSkills(extractedSkills);

      if (extractedSkills.length > 0 && resumeId) {
        await (supabase as any).from("extracted_skills").insert(
          extractedSkills.map((s) => ({
            user_id: user.id,
            resume_id: resumeId,
            skill_name: s.skill_name,
            proficiency_level: s.proficiency_level || "beginner",
          }))
        );
      }

      // Add to saved resumes list
      setSavedResumes(prev => [{
        id: resumeId,
        file_name: f.name,
        created_at: new Date().toISOString(),
        skills: extractedSkills,
      }, ...prev]);

      setStep("done");
      toast({ title: "Resume analyzed!", description: `Found ${extractedSkills.length} skills.` });
    } catch (err: unknown) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to process resume");
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to process resume", variant: "destructive" });
    }
  }, [user, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setSkills([]);
    setStep("idle");
    setErrorMsg("");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            Resume Upload
          </h1>
          <p className="text-muted-foreground mt-1">Upload your resume and AI will extract your skills to personalize interviews.</p>
        </motion.div>

        {/* Upload Area */}
        {step === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
              dragOver ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/50 hover:bg-secondary/30"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={onFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
            <h3 className="text-lg font-semibold mb-2">Drop your resume here</h3>
            <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded bg-secondary">PDF</span>
              <span className="px-2 py-1 rounded bg-secondary">DOCX</span>
              <span className="px-2 py-1 rounded bg-secondary">DOC</span>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {(step === "extracting" || step === "analyzing") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="relative mx-auto mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {step === "extracting" ? (
                  <FileText className="h-7 w-7 text-primary" />
                ) : (
                  <Brain className="h-7 w-7 text-primary" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {step === "extracting" ? "Extracting Text..." : "Analyzing Skills with AI..."}
            </h3>
            <p className="text-muted-foreground text-sm">{file?.name}</p>
            <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-primary" />
          </motion.div>
        )}

        {/* Error State */}
        {step === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 text-center border-rose-500/30"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Processing Failed</h3>
            <p className="text-muted-foreground text-sm mb-4">{errorMsg}</p>
            <Button onClick={reset} variant="outline">Try Again</Button>
          </motion.div>
        )}

        {/* Success State (just uploaded) */}
        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-xl p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle className="h-5 w-5 text-brand-emerald" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{file?.name}</div>
                <div className="text-xs text-muted-foreground">{skills.length} skills extracted</div>
              </div>
              <button onClick={reset} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <SkillsList skills={skills} onUpdate={setSkills} />

            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1">Upload Another</Button>
              <Button asChild className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
                <a href="/interview/select">Start Interview</a>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Previously Uploaded Resumes */}
        {step === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Previously Uploaded Resumes
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : savedResumes.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground text-sm">No resumes uploaded yet. Upload one above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedResumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SkillsList({ skills, onUpdate }: { skills: Skill[]; onUpdate?: (s: Skill[]) => void }) {
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        Extracted Skills ({skills.length})
      </h2>
      {skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">No skills could be extracted.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                proficiencyColors[skill.proficiency_level] || proficiencyColors.beginner
              }`}
            >
              {skill.skill_name}
              {onUpdate && (
                <Select
                  value={skill.proficiency_level}
                  onValueChange={(val) => {
                    onUpdate(skills.map((s, idx) => idx === i ? { ...s, proficiency_level: val } : s));
                  }}
                >
                  <SelectTrigger className="h-5 w-auto border-0 bg-transparent p-0 pl-1 text-xs opacity-70 hover:opacity-100 shadow-none focus:ring-0 [&>svg]:h-3 [&>svg]:w-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">beginner</SelectItem>
                    <SelectItem value="intermediate">intermediate</SelectItem>
                    <SelectItem value="advanced">advanced</SelectItem>
                    <SelectItem value="expert">expert</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResumeCard({ resume }: { resume: SavedResume }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{resume.file_name}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(resume.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {" · "}{resume.skills.length} skills
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </motion.div>
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          {resume.skills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No skills extracted.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, i) => (
                <span
                  key={i}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    proficiencyColors[skill.proficiency_level] || proficiencyColors.beginner
                  }`}
                >
                  {skill.skill_name}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
