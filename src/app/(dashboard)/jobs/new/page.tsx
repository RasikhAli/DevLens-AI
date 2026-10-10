"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { WeightSlider } from "@/components/job-matching/WeightSlider";
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeights } from "@/lib/scoring/types";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parsingAI, setParsingAI] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["TypeScript", "React", "PostgreSQL"]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(["Docker", "CI/CD"]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newPrefInput, setNewPrefInput] = useState("");
  const [requiredExperience, setRequiredExperience] = useState(3);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);
  const [error, setError] = useState<string | null>(null);

  // AI requirement extractor
  const handleExtractWithAI = async () => {
    if (!description.trim() || description.length < 20) {
      setError("Please paste a comprehensive job description first (at least 20 characters).");
      return;
    }

    setParsingAI(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs/temp/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      // If temporary route isn't available, call mock/ai parse directly
      if (!res.ok) {
        // Fallback extraction
        const commonSkills = ["TypeScript", "React", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"];
        const found = commonSkills.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(description));
        if (found.length > 0) {
          setRequiredSkills(found.slice(0, 4));
          setPreferredSkills(found.slice(4));
        }
      } else {
        const data = await res.json();
        if (data.parsed) {
          if (data.parsed.title && !title) setTitle(data.parsed.title);
          if (data.parsed.requiredSkills?.length) setRequiredSkills(data.parsed.requiredSkills);
          if (data.parsed.preferredSkills?.length) setPreferredSkills(data.parsed.preferredSkills);
          if (data.parsed.requiredExperienceYears) setRequiredExperience(data.parsed.requiredExperienceYears);
        }
      }
    } catch {
      // Fallback extraction
      const commonSkills = ["TypeScript", "React", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes"];
      const found = commonSkills.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(description));
      if (found.length > 0) {
        setRequiredSkills(found.slice(0, 4));
        setPreferredSkills(found.slice(4));
      }
    } finally {
      setParsingAI(false);
    }
  };

  const addRequiredSkill = () => {
    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const addPreferredSkill = () => {
    if (newPrefInput.trim() && !preferredSkills.includes(newPrefInput.trim())) {
      setPreferredSkills([...preferredSkills, newPrefInput.trim()]);
      setNewPrefInput("");
    }
  };

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please specify both job title and description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim() || undefined,
          description: description.trim(),
          requiredSkills,
          preferredSkills,
          requiredExperience,
          scoringWeights: weights,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job");

      router.push(`/jobs/${data.job.id}/match`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Create Job Requirement" />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Define Target Position & Scoring Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste a job description to automatically extract technical requirements, or configure mandatory and preferred skills manually.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Job Details & Raw Specification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Position Title *</label>
                  <Input
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Company / Department</label>
                  <Input
                    placeholder="e.g. Acme Cloud Systems"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-foreground">Job Description Text *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExtractWithAI}
                    disabled={parsingAI}
                    className="h-7 px-2.5 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                  >
                    {parsingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Extract Requirements with AI
                  </Button>
                </div>
                <textarea
                  rows={6}
                  placeholder="Paste complete job description, technical requirements, responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Minimum Experience (Years)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={requiredExperience}
                  onChange={(e) => setRequiredExperience(parseInt(e.target.value, 10) || 0)}
                  className="w-32 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Structured Requirements */}
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Parsed Requirements (User-Verified)</CardTitle>
              <CardDescription className="text-xs">
                Review and adjust extracted skills. Mandatory requirements receive highest deterministic weight.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mandatory Skills */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Mandatory Required Skills ({requiredSkills.length})
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {requiredSkills.map((sk) => (
                    <Badge key={sk} variant="default" className="text-xs py-1 px-2.5 gap-1.5">
                      {sk}
                      <X
                        className="w-3 h-3 cursor-pointer hover:opacity-75"
                        onClick={() => removeRequiredSkill(sk)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <Input
                    placeholder="Add mandatory skill..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequiredSkill())}
                    className="text-xs h-8"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addRequiredSkill} className="h-8 text-xs">
                    Add
                  </Button>
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Preferred / Nice-to-Have Skills ({preferredSkills.length})
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {preferredSkills.map((sk) => (
                    <Badge key={sk} variant="secondary" className="text-xs py-1 px-2.5 gap-1.5">
                      {sk}
                      <X
                        className="w-3 h-3 cursor-pointer hover:opacity-75"
                        onClick={() => removePreferredSkill(sk)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <Input
                    placeholder="Add preferred skill..."
                    value={newPrefInput}
                    onChange={(e) => setNewPrefInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredSkill())}
                    className="text-xs h-8"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={addPreferredSkill} className="h-8 text-xs">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Weight Configuration */}
          <WeightSlider
            weights={weights}
            onChange={setWeights}
            onReset={() => setWeights(DEFAULT_SCORING_WEIGHTS)}
          />

          <Button type="submit" disabled={loading} className="w-full text-xs h-11 gap-2 font-semibold shadow-md">
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Save Position & Proceed to Candidate Matching
          </Button>
        </form>
      </div>
    </div>
  );
}
