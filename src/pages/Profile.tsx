import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, Trophy, Code2, MessageSquare, Brain,
  TrendingUp, Clock, Target, Edit3, Check, X, Loader2,
  MapPin, Briefcase, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  location: string | null;
  bio: string | null;
  experience_level: string | null;
}

interface InterviewStat {
  type: string;
  count: number;
  avgScore: number;
}

const typeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  coding: { label: "Coding", icon: Code2, color: "text-brand-cyan", bg: "bg-cyan-500/15 border-cyan-500/30" },
  hr: { label: "HR", icon: MessageSquare, color: "text-brand-emerald", bg: "bg-emerald-500/15 border-emerald-500/30" },
  aptitude: { label: "Aptitude", icon: Brain, color: "text-brand-amber", bg: "bg-amber-500/15 border-amber-500/30" },
  combined: { label: "Combined", icon: Target, color: "text-brand-purple", bg: "bg-purple-500/15 border-purple-500/30" },
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editExperience, setEditExperience] = useState("beginner");
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [overallAvg, setOverallAvg] = useState(0);
  const [interviewStats, setInterviewStats] = useState<InterviewStat[]>([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [skillCount, setSkillCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [profileRes, interviewRes, resumeRes, skillRes] = await Promise.all([
        (supabase as any).from("profiles").select("*").eq("user_id", user.id).single(),
        (supabase as any).from("interviews").select("*").eq("user_id", user.id),
        (supabase as any).from("resumes").select("id").eq("user_id", user.id),
        (supabase as any).from("extracted_skills").select("id").eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditName(profileRes.data.full_name || "");
        setEditLocation(profileRes.data.location || "");
        setEditBio(profileRes.data.bio || "");
        setEditExperience(profileRes.data.experience_level || "beginner");
      } else {
        // Profile doesn't exist, create one
        const fullName = user.user_metadata?.full_name || null;
        const { data: newProfile } = await (supabase as any)
          .from("profiles")
          .insert({ user_id: user.id, full_name: fullName })
          .select("*")
          .single();
        if (newProfile) {
          setProfile(newProfile);
          setEditName(newProfile.full_name || "");
          setEditLocation(newProfile.location || "");
          setEditBio(newProfile.bio || "");
          setEditExperience(newProfile.experience_level || "beginner");
        }
      }

      if (interviewRes.data) {
        const interviews = interviewRes.data;
        setTotalInterviews(interviews.length);
        const completed = interviews.filter((i: any) => i.status === "completed");
        setCompletedCount(completed.length);

        if (completed.length > 0) {
          const avg = Math.round(
            completed.reduce((a: number, b: any) => a + (b.max_score > 0 ? (b.total_score / b.max_score) * 100 : 0), 0) / completed.length
          );
          setOverallAvg(avg);
        }

        // Stats by type
        const byType: Record<string, { count: number; totalPct: number }> = {};
        completed.forEach((i: any) => {
          if (!byType[i.interview_type]) byType[i.interview_type] = { count: 0, totalPct: 0 };
          byType[i.interview_type].count++;
          byType[i.interview_type].totalPct += i.max_score > 0 ? (i.total_score / i.max_score) * 100 : 0;
        });
        setInterviewStats(
          Object.entries(byType).map(([type, data]) => ({
            type,
            count: data.count,
            avgScore: Math.round(data.totalPct / data.count),
          }))
        );
      }

      setResumeCount(resumeRes.data?.length || 0);
      setSkillCount(skillRes.data?.length || 0);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const updates = {
      full_name: editName.trim() || null,
      location: editLocation.trim() || null,
      bio: editBio.trim() || null,
      experience_level: editExperience,
    };
    const { error } = await (supabase as any)
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      setProfile((p) => p ? { ...p, ...updates } : p);
      setEditing(false);
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-glow">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name */}
              <div className="flex items-center gap-2 mb-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9 w-56 bg-secondary/50"
                      placeholder="Your name"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditing(true)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Member since {memberSince}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground">
                  <Trophy className="h-3 w-3" /> {completedCount} interviews completed
                </span>
                {profile?.location && !editing && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </span>
                )}
                {profile?.experience_level && !editing && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary border border-border/60 text-muted-foreground capitalize">
                    <Briefcase className="h-3 w-3" /> {profile.experience_level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="mt-6 pt-6 border-t border-border/40 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Location
                  </Label>
                  <Input
                    id="location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="City, Country"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="experience" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" /> Experience Level
                  </Label>
                  <Select value={editExperience} onValueChange={setEditExperience}>
                    <SelectTrigger id="experience" className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Bio
                </Label>
                <Textarea
                  id="bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="A short introduction about yourself..."
                  rows={3}
                  className="bg-secondary/50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => {
                  setEditing(false);
                  setEditName(profile?.full_name || "");
                  setEditLocation(profile?.location || "");
                  setEditBio(profile?.bio || "");
                  setEditExperience(profile?.experience_level || "beginner");
                }}>
                  <X className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
                <Button onClick={handleSaveName} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total Sessions", value: totalInterviews, icon: Clock, color: "text-primary" },
            { label: "Avg Score", value: `${overallAvg}%`, icon: TrendingUp, color: "text-brand-emerald" },
            { label: "Resumes", value: resumeCount, icon: User, color: "text-brand-cyan" },
            { label: "Skills Found", value: skillCount, icon: Target, color: "text-brand-amber" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Performance by Type */}
        {interviewStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Breakdown
            </h2>
            <div className="space-y-4">
              {interviewStats.map((stat) => {
                const config = typeConfig[stat.type] || typeConfig.coding;
                return (
                  <div key={stat.type} className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${config.bg}`}>
                      <config.icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="text-sm text-muted-foreground">{stat.count} completed · {stat.avgScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.avgScore}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className={`h-full rounded-full ${
                            stat.avgScore >= 70 ? "bg-emerald-500" : stat.avgScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs text-muted-foreground">{user?.id?.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Auth Provider</span>
              <span className="capitalize">{user?.app_metadata?.provider || "email"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
