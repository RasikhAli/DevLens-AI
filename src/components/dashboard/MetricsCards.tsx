import React from "react";
import { Users, Briefcase, GitCompare, ShieldCheck, TrendingUp, Sparkles, FolderGit2 } from "lucide-react";

export function MetricsCards({
  metrics,
}: {
  metrics: {
    totalProfiles: number;
    totalJobs: number;
    totalComparisons: number;
    pendingImports: number;
  };
}) {
  const cards = [
    {
      title: "Developer Profiles",
      value: metrics.totalProfiles,
      subtitle: "Full evidence tracking",
      icon: Users,
      trend: "Multi-Source Merged",
      accent: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Active Job Requirements",
      value: metrics.totalJobs,
      subtitle: "Custom scoring weights",
      icon: Briefcase,
      trend: "Deterministic",
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Completed Comparisons",
      value: metrics.totalComparisons,
      subtitle: "Side-by-side matrices",
      icon: GitCompare,
      trend: "Audited Diff",
      accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
    },
    {
      title: "Verification Pipeline",
      value: "100%",
      subtitle: "Traceable claim evidence",
      icon: ShieldCheck,
      trend: "Audit-Ready",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="bento-card group p-5 flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1 my-3">
              <div className="text-3xl font-black font-mono tracking-tight text-foreground">
                {c.value}
              </div>
              <p className="text-[11px] text-muted-foreground">{c.subtitle}</p>
            </div>

            <div className="pt-2 border-t border-border/70 dark:border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Status
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{c.trend}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
