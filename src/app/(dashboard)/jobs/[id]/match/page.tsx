"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { CandidateRankingTable } from "@/components/job-matching/CandidateRankingTable";
import { WeightSlider } from "@/components/job-matching/WeightSlider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
} from "lucide-react";
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeights, type CandidateEvaluationResult } from "@/lib/scoring/types";
import type { StoredJob, StoredDeveloperProfile } from "@/lib/data/store";

export default function JobMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<StoredJob | null>(null);
  const [profiles, setProfiles] = useState<StoredDeveloperProfile[]>([]);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_SCORING_WEIGHTS);
  const [rankings, setRankings] = useState<CandidateEvaluationResult[]>([]);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  // Load Job and Candidates
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobRes, profilesRes] = await Promise.all([
          fetch(`/api/jobs/${jobId}`),
          fetch("/api/profiles"),
        ]);

        if (jobRes.ok) {
          const jData = await jobRes.json();
          setJob(jData.job);
          if (jData.job.scoringWeights) {
            setWeights(jData.job.scoringWeights);
          }
        }

        if (profilesRes.ok) {
          const pData = await profilesRes.json();
          const profs: StoredDeveloperProfile[] = pData.profiles || [];
          setProfiles(profs);
          // Auto select all candidates initially for complete evaluation
          setSelectedDevIds(profs.map((p) => p.id));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  // Execute deterministic ranking
  const runMatchEvaluation = async () => {
    if (selectedDevIds.length === 0) return;
    setMatching(true);

    try {
      const res = await fetch("/api/compare/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          developerIds: selectedDevIds,
          weights,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
        setComparisonId(data.comparisonId);
      }
    } finally {
      setMatching(false);
    }
  };

  useEffect(() => {
    if (profiles.length > 0 && selectedDevIds.length > 0 && job) {
      runMatchEvaluation();
    }
  }, [selectedDevIds, weights, job]);

  const toggleSelectDev = (id: string) => {
    setSelectedDevIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedDevIds(profiles.map((p) => p.id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Candidate-to-Job Matching Engine" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Job Header Card */}
        {job && (
          <Card className="border-border bg-card/90 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                    {job.company && (
                      <span className="text-xs text-muted-foreground font-medium">at {job.company}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-3xl line-clamp-2">
                    {job.description}
                  </p>
                </div>

                {comparisonId && (
                  <a
                    href={`/api/reports/${comparisonId}/export?format=csv`}
                    download
                    className="shrink-0"
                  >
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      Export CSV Report
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-foreground text-[11px]">Required:</span>
              {job.requiredSkills.map((sk) => (
                <Badge key={sk} variant="default" className="text-[10px] px-2 py-0.5">
                  {sk}
                </Badge>
              ))}
              {job.preferredSkills.length > 0 && (
                <>
                  <span className="font-semibold text-muted-foreground text-[11px] ml-2">Preferred:</span>
                  {job.preferredSkills.map((sk) => (
                    <Badge key={sk} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {sk}
                    </Badge>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dynamic Weight Adjustment */}
        <WeightSlider
          weights={weights}
          onChange={setWeights}
          onReset={() => setWeights(DEFAULT_SCORING_WEIGHTS)}
        />

        {/* Candidate Pool Selection Bar */}
        <Card className="border-border bg-card/70">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Evaluated Candidates ({selectedDevIds.length} of {profiles.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs text-primary">
              Select All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {profiles.map((p) => {
                const isSelected = selectedDevIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleSelectDev(p.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      ({p.skills.length} skills)
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ranked Candidate Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">
                Ranked Candidates ({rankings.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Evaluated deterministically according to active weights. Ranked by total score, with evidence coverage as tiebreaker.
              </p>
            </div>
          </div>

          {loading || matching ? (
            <div className="py-24 text-center text-xs text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              Computing deterministic multi-candidate alignment...
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-16 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-2">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No candidates selected</p>
              <p className="text-xs text-muted-foreground">
                Select one or more developer profiles above to compute job alignment rankings.
              </p>
            </div>
          ) : (
            <CandidateRankingTable rankings={rankings} jobId={jobId} />
          )}
        </div>
      </div>
    </div>
  );
}
