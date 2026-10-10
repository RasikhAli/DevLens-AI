"use client";

import React from "react";
import { Sliders, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ScoringWeights } from "@/lib/scoring/types";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/scoring/types";

export function WeightSlider({
  weights,
  onChange,
  onReset,
}: {
  weights: ScoringWeights;
  onChange: (weights: ScoringWeights) => void;
  onReset: () => void;
}) {
  const total =
    weights.techSkills +
    weights.projectRelevance +
    weights.experienceAlignment +
    weights.engineeringPractices +
    weights.otherRequirements;

  const handleWeightChange = (key: keyof ScoringWeights, val: number) => {
    onChange({
      ...weights,
      [key]: val,
    });
  };

  const sliders: Array<{ key: keyof ScoringWeights; label: string; desc: string }> = [
    { key: "techSkills", label: "Technical Skills Alignment", desc: "Normalized required & preferred skill matches" },
    { key: "projectRelevance", label: "Project Relevance", desc: "Demonstrated production stacks & complexity" },
    { key: "experienceAlignment", label: "Experience Alignment", desc: "Relevant roles, engineering scope & trajectory" },
    { key: "engineeringPractices", label: "Engineering Practices Evidence", desc: "Verifiable test suites, CI/CD, documentation" },
    { key: "otherRequirements", label: "Domain & Explicit Requirements", desc: "Industry domain, explicit qualifications" },
  ];

  return (
    <div className="bento-card rounded-2xl p-5 border border-border/70 dark:border-white/10">
      <div className="pb-3 border-b border-border/70 dark:border-white/10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Configurable Scoring Weights</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            Total: <span className={total === 100 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>{total}%</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </Button>
        </div>
      </div>
      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {sliders.map((s) => (
          <div
            key={s.key}
            className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-muted/40 dark:border-white/5 dark:bg-zinc-900/40 hover:border-violet-500/40 transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground text-[11px] truncate" title={s.label}>
                {s.label}
              </span>
              <span className="font-mono font-bold text-violet-600 dark:text-violet-400 text-xs">{weights[s.key]}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={weights[s.key]}
              onChange={(e) => handleWeightChange(s.key, parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-muted dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
