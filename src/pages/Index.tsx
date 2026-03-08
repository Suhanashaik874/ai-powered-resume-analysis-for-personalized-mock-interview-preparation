import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Code2, MessageSquare, BarChart3, Upload, Zap, Star, ArrowRight, CheckCircle, Users, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: Code2,
    title: "Coding Interviews",
    description: "Practice with real algorithmic problems in a Monaco editor with live code execution via Piston API.",
    color: "text-brand-cyan",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: MessageSquare,
    title: "HR Interviews",
    description: "Behavioral questions with voice-to-text support. Practice your soft skills and communication.",
    color: "text-brand-emerald",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Brain,
    title: "Aptitude Tests",
    description: "Sharpen your logical reasoning, verbal ability, and quantitative aptitude under timed conditions.",
    color: "text-brand-amber",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Upload,
    title: "Resume Analysis",
    description: "Upload your resume and AI extracts your skills to generate personalized interview questions.",
    color: "text-brand-purple",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Zap,
    title: "AI Evaluation",
    description: "Get detailed AI-powered feedback on every answer with scores, optimal solutions, and improvement tips.",
    color: "text-brand-indigo",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Performance Tracking",
    description: "Track your progress across sessions with comprehensive score history and trend analysis.",
    color: "text-brand-rose",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

const steps = [
  { step: "01", title: "Upload Resume", desc: "AI extracts your skills and tech stack to personalize your interview." },
  { step: "02", title: "Choose Interview", desc: "Select from Coding, HR, Aptitude, or Combined interview modes." },
  { step: "03", title: "Practice", desc: "Answer questions with our live editor, voice input, or text responses." },
  { step: "04", title: "Get Feedback", desc: "Receive detailed AI scoring, feedback, and optimal solutions instantly." },
];

const stats = [
  { icon: Users, value: "10K+", label: "Candidates Prepared" },
  { icon: Trophy, value: "92%", label: "Interview Success Rate" },
  { icon: Target, value: "500+", label: "Question Bank" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/8 blur-[100px]" />

        <div className="container relative z-10 mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Resume Analysis & Interview Preparation
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl"
          >
            AI Powered{" "}
            <span className="gradient-text">Resume Analysis</span>
            {" "}for Personalized Mock Interview Preparation
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Upload your resume and let AI analyze your skills to generate personalized mock interviews — coding, HR, and aptitude — with instant feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90 glow px-8 py-6 text-base">
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base border-border/60">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-5 text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">Everything You Need to{" "}
              <span className="gradient-text">Prepare & Succeed</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              A complete resume-driven interview preparation platform powered by cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card group rounded-2xl p-6 transition-all hover:border-primary/30 hover:shadow-glow"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/30" />
        <div className="container relative mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to interview mastery.</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-2xl font-black text-primary-foreground shadow-glow">
                  {step.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center shadow-glow-lg"
          >
            <div className="absolute inset-0 grid-overlay opacity-20" />
            <div className="relative z-10">
              <h2 className="mb-4 text-4xl font-bold text-primary-foreground">
                Ready to Land Your Dream Job?
              </h2>
              <p className="mb-8 text-primary-foreground/80 text-lg mx-auto max-w-xl">
                Join thousands of engineers who've used AIPIP to prepare and succeed.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-base font-semibold">
                    Start Free Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  No credit card required
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold gradient-text">AIPIP</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 AIPIP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
