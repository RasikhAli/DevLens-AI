"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Award, ShieldCheck, ChevronDown, ChevronUp, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CategoryScoreBar, EvidenceCoverageGauge } from "@/components/charts/CategoryScoreBar";
import { getScoreColor } from "@/lib/utils";
import type { CandidateEvaluationResult } from "@/lib/scoring/types";

export function CandidateRankingTable({
  rankings,
  jobId,
}: {
  rankings: CandidateEvaluationResult[];
  jobId?: string;
}) {
  const [expandedDevId, setExpandedDevId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {rankings.map((candidate, idx) => {
        const isExpanded = expandedDevId === candidate.developerProfileId;
        const scoreStyle = getScoreColor(candidate.totalScore);

        return (
          <div
            key={candidate.developerProfileId}
            className={`bento-card rounded-2xl p-5 md:p-6 transition-all duration-300 relative overflow-hidden ${
              idx === 0
                ? "border-violet-500/50 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/20"
                : "border-border/70 dark:border-border/60 hover:border-violet-500/30"
            }`}
          >
            {/* Ambient top-right glow for #1 */}
            {idx === 0 && (
              <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Candidate Info and Rank */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                      idx === 0
                        ? "bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-inner"
                        : "bg-muted/60 text-muted-foreground border border-border"
                    }`}
                  >
                    #{candidate.ranking || idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/profiles/${candidate.developerProfileId}`}
                        className="font-bold text-base text-foreground hover:text-primary transition-colors"
                      >
                        {candidate.developerName}
                      </Link>
                      {idx === 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                          <Award className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Top Evidence Match
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>Evidence Coverage:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {candidate.evidenceCoverage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score & Expansion */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                      Deterministic Score
                    </div>
                    <div className={`text-3xl font-black font-mono tracking-tight ${scoreStyle.text}`}>
                      {candidate.totalScore}
                      <span className="text-xs text-muted-foreground font-normal">/100</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedDevId(isExpanded ? null : candidate.developerProfileId)}
                    className="h-9 px-3.5 text-xs gap-1.5 border-border dark:border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 transition-colors"
                  >
                    {isExpanded ? "Hide Breakdown" : "Inspect Breakdown"}
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Quick Strengths and Gaps Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Strengths
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {candidate.strengths[0] || "Foundational technology alignment verified."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Gaps / Missing Evidence
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {candidate.gaps[0] || "No critical gaps identified in required criteria."}
                  </p>
                </div>
              </div>

              {/* Expanded Detailed Breakdown */}
              {isExpanded && (
                <div className="pt-4 border-t border-border/60 space-y-5 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Scores Column */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        Deterministic Category Score Breakdown
                      </h4>
                      <CategoryScoreBar
                        categories={[
                          {
                            name: "Technical Skills Alignment",
                            score: candidate.categories.techSkills.score,
                            weight: candidate.categories.techSkills.weight,
                            notes: candidate.categories.techSkills.notes,
                          },
                          {
                            name: "Project Relevance",
                            score: candidate.categories.projectRelevance.score,
                            weight: candidate.categories.projectRelevance.weight,
                            notes: candidate.categories.projectRelevance.notes,
                          },
                          {
                            name: "Experience Alignment",
                            score: candidate.categories.experienceAlignment.score,
                            weight: candidate.categories.experienceAlignment.weight,
                            notes: candidate.categories.experienceAlignment.notes,
                          },
                          {
                            name: "Engineering Practices",
                            score: candidate.categories.engineeringPractices.score,
                            weight: candidate.categories.engineeringPractices.weight,
                            notes: candidate.categories.engineeringPractices.notes,
                          },
                          {
                            name: "Other Explicit Requirements",
                            score: candidate.categories.otherRequirements.score,
                            weight: candidate.categories.otherRequirements.weight,
                            notes: candidate.categories.otherRequirements.notes,
                          },
                        ]}
                      />
                    </div>

                    {/* Evidence & Methodology Column */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Evidence Reliability
                      </h4>
                      <EvidenceCoverageGauge coverage={candidate.evidenceCoverage} />

                      <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-black/40 text-xs space-y-1.5">
                        <span className="font-semibold text-foreground text-[11px] block">
                          Deterministic Calculation Explanation
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {candidate.explanation}
                        </p>
                      </div>

                      <Link href={`/profiles/${candidate.developerProfileId}`} className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs gap-1.5 border-border dark:border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10"
                        >
                          Open Candidate Evidence Trail <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
