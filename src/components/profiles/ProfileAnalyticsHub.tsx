"use client";

import React, { useMemo } from "react";
import { type StoredDeveloperProfile } from "@/lib/data/store";
import {
  Code2,
  CheckCircle2,
  Cpu,
  Layers,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  Flame,
  Award,
  Sparkles,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileAnalyticsHubProps {
  profile: StoredDeveloperProfile;
}

// Curated language palette for vibrant, modern visualization
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Java: "#EA2D2E",
  "C++": "#00599C",
  C: "#A8B9CC",
  Go: "#00ADD8",
  Rust: "#DEA584",
  PHP: "#777BB4",
  Ruby: "#CC342D",
  HTML: "#E34F26",
  CSS: "#1572B6",
  Shell: "#89E051",
  Kotlin: "#7F52FF",
  Swift: "#F05138",
  Dart: "#0175C2",
  "Jupyter Notebook": "#DA5B0B",
  Vue: "#4FC08D",
};

export function ProfileAnalyticsHub({ profile }: ProfileAnalyticsHubProps) {
  const repos = profile.projects;
  const totalRepos = repos.length;

  // 1. Language Breakdown Calculations
  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    repos.forEach((r) => {
      const lang = r.primaryLanguage || (r.technologies && r.technologies[0]);
      if (lang && lang.trim()) {
        counts[lang] = (counts[lang] || 0) + 1;
      }
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const totalCounted = entries.reduce((acc, [, count]) => acc + count, 0);

    return entries.map(([name, count]) => {
      const percentage = totalCounted > 0 ? Math.round((count / totalCounted) * 100) : 0;
      const color = LANGUAGE_COLORS[name] || "#8B5CF6";
      return { name, count, percentage, color };
    });
  }, [repos]);

  // 2. Engineering Quality Metrics
  const testedCount = repos.filter((r) => r.hasTests).length;
  const testRate = totalRepos > 0 ? Math.round((testedCount / totalRepos) * 100) : 0;

  const ciCount = repos.filter((r) => r.hasCI).length;
  const ciRate = totalRepos > 0 ? Math.round((ciCount / totalRepos) * 100) : 0;

  const docsCount = repos.filter((r) => r.hasDocs || (r.description && r.description.length > 20)).length;
  const docsRate = totalRepos > 0 ? Math.round((docsCount / totalRepos) * 100) : 0;

  const avgComplexity = totalRepos > 0
    ? Math.round(repos.reduce((acc, r) => acc + (r.complexityScore || 50), 0) / totalRepos)
    : 50;

  // 3. Complexity Tiers
  const highTier = repos.filter((r) => (r.complexityScore || 50) >= 70).length;
  const midTier = repos.filter((r) => (r.complexityScore || 50) >= 50 && (r.complexityScore || 50) < 70).length;
  const utilityTier = repos.filter((r) => (r.complexityScore || 50) < 50).length;

  // 4. Engineering Maturity Score (0-100)
  const maturityScore = Math.min(
    100,
    Math.round(
      (testRate * 0.35) +
      (ciRate * 0.30) +
      (docsRate * 0.15) +
      (Math.min(100, avgComplexity) * 0.20)
    )
  );

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-border/70 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-violet-500" />
          <h3 className="font-bold text-lg text-foreground tracking-tight">
            Engineering Analytics & Code Quality Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            Analysis scope: <strong className="text-foreground">{totalRepos} repositories</strong>
          </span>
        </div>
      </div>

      {/* TOP ROW: 3 HIGH-DENSITY ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Language & Stack Distribution */}
        <div className="bento-card p-5 space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Language & Technology Share
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {languageStats.length} languages detected
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 border border-border/60">
            {languageStats.map((item) => (
              <div
                key={item.name}
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-80"
                title={`${item.name}: ${item.percentage}% (${item.count} repos)`}
              />
            ))}
          </div>

          {/* Language Legend Tags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
            {languageStats.slice(0, 8).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-foreground truncate text-[11px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-1">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Engineering Maturity Index Gauge */}
        <div className="bento-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Engineering Discipline
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-500">
              {maturityScore >= 70 ? "Grade A" : maturityScore >= 50 ? "Grade B" : "Grade C"}
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl font-black font-mono text-foreground">
              {maturityScore}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Composite score across automated tests, CI workflows & docs
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Test Suite Adoption
              </span>
              <span className="font-mono font-bold text-foreground">{testRate}%</span>
            </div>
            <Progress value={testRate} className="h-1.5" />

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-500" /> CI/CD Automation
              </span>
              <span className="font-mono font-bold text-foreground">{ciRate}%</span>
            </div>
            <Progress value={ciRate} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* SECOND ROW: REPOSITORY COMPLEXITY INDEX & TIER DISTRIBUTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Flagship Applications */}
        <div className="bento-card p-4 space-y-2 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-violet-500" /> High-Complexity Systems
            </span>
            <span className="text-xs font-mono font-bold text-violet-500">
              {highTier} repos
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Architecture score ≥ 70: Features active multi-tier codebases, tests, or pipelines.
          </p>
          <div className="text-[10px] font-mono text-muted-foreground pt-1">
            Share: {totalRepos > 0 ? Math.round((highTier / totalRepos) * 100) : 0}% of total catalog
          </div>
        </div>

        {/* Tier 2: Mid-Tier Production Services */}
        <div className="bento-card p-4 space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" /> Production & Mid-Tier
            </span>
            <span className="text-xs font-mono font-bold text-cyan-500">
              {midTier} repos
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Architecture score 50–69: Standard web services, standalone tools, and components.
          </p>
          <div className="text-[10px] font-mono text-muted-foreground pt-1">
            Share: {totalRepos > 0 ? Math.round((midTier / totalRepos) * 100) : 0}% of total catalog
          </div>
        </div>

        {/* Tier 3: Utilities & Prototypes */}
        <div className="bento-card p-4 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-500" /> Utilities & Prototypes
            </span>
            <span className="text-xs font-mono font-bold text-amber-500">
              {utilityTier} repos
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Architecture score &lt; 50: Focused scripts, configuration libraries, and prototypes.
          </p>
          <div className="text-[10px] font-mono text-muted-foreground pt-1">
            Share: {totalRepos > 0 ? Math.round((utilityTier / totalRepos) * 100) : 0}% of total catalog
          </div>
        </div>
      </div>
    </div>
  );
}
