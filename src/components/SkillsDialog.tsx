import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Brain, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  skill_name: string;
  proficiency_level: string;
}

interface SkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proficiencyLevels = ["beginner", "intermediate", "advanced", "expert"];

const proficiencyColors: Record<string, string> = {
  beginner: "#10b981", // emerald
  intermediate: "#f59e0b", // amber
  advanced: "#3b82f6", // blue
  expert: "#8b5cf6", // purple
};

const proficiencyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export function SkillsDialog({ open, onOpenChange }: SkillsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchSkills();
    }
  }, [open, user]);

  const fetchSkills = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("extracted_skills")
      .select("id, skill_name, proficiency_level")
      .eq("user_id", user.id)
      .order("skill_name");

    if (error) {
      toast({
        title: "Failed to load skills",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSkills(data || []);
    }
    setLoading(false);
  };

  const handleProficiencyChange = async (skillId: string, newLevel: string) => {
    const { error } = await supabase
      .from("extracted_skills")
      .update({ proficiency_level: newLevel })
      .eq("id", skillId);

    if (error) {
      toast({
        title: "Failed to update skill",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSkills((prev) =>
        prev.map((s) => (s.id === skillId ? { ...s, proficiency_level: newLevel } : s))
      );
      toast({
        title: "Skill updated",
        description: "Proficiency level has been updated successfully.",
      });
    }
  };

  // Calculate distribution for chart
  const distribution = proficiencyLevels.map((level) => ({
    name: proficiencyLabels[level],
    count: skills.filter((s) => s.proficiency_level === level).length,
    level,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Skills Identified ({skills.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proficiency Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Proficiency Distribution
              </CardTitle>
              <CardDescription>Breakdown of your technical skills by proficiency level</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">Loading...</div>
                </div>
              ) : skills.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Brain className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No skills identified yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Upload a resume to get started.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={proficiencyColors[entry.level]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Skills List with Editable Proficiency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Skills</CardTitle>
              <CardDescription>Edit proficiency levels to keep them up to date</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-8 bg-muted rounded w-32" />
                    </div>
                  ))}
                </div>
              ) : skills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No skills to display</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.skill_name}</span>
                      </div>
                      <Select
                        value={skill.proficiency_level}
                        onValueChange={(value) => handleProficiencyChange(skill.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: proficiencyColors[level],
                                  color: proficiencyColors[level],
                                }}
                              >
                                {proficiencyLabels[level]}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
