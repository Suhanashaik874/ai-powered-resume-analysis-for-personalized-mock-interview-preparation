import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Brain, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  skill_name: string;
  proficiency_level: string;
}

const proficiencyColors: Record<string, string> = {
  beginner: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  expert: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

async function extractTextFromPDF(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
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
  const [extractedText, setExtractedText] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [step, setStep] = useState<"idle" | "extracting" | "analyzing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      setExtractedText(text);

      // Save resume to DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: resumeData, error: resumeError } = await (supabase as any).from("resumes").insert({
        user_id: user.id,
        file_name: f.name,
        raw_text: text,
      }).select().single();

      if (resumeError) throw resumeError;

      const resumeId = (resumeData as { id: string })?.id;

      // Call edge function to extract skills
      setStep("analyzing");
      const { data, error } = await supabase.functions.invoke("extract-skills", {
        body: { resumeText: text, resumeId, userId: user.id },
      });

      if (error) throw error;

      const extractedSkills: Skill[] = data?.skills || [];
      setSkills(extractedSkills);

      // Save skills to DB
      if (extractedSkills.length > 0 && resumeId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("extracted_skills").insert(
          extractedSkills.map((s) => ({
            user_id: user.id,
            resume_id: resumeId,
            skill_name: s.skill_name,
            proficiency_level: s.proficiency_level || "beginner",
          }))
        );
      }

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
    setExtractedText("");
    setSkills([]);
    setStep("idle");
    setErrorMsg("");
  };

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

        {/* Success State */}
        {step === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* File Info */}
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

            {/* Skills */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Extracted Skills ({skills.length})
              </h2>
              {skills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No skills could be extracted. Try a more detailed resume.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                        proficiencyColors[skill.proficiency_level] || proficiencyColors.beginner
                      }`}
                    >
                      {skill.skill_name}
                      <span className="text-xs opacity-60">· {skill.proficiency_level}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1">Upload Another</Button>
              <Button asChild className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
                <a href="/interview/select">Start Interview</a>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
