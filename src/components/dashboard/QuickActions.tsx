"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, Upload, Github, GitCompare, PlusCircle, CheckSquare, Sparkles, ArrowRight } from "lucide-react";

export function QuickActions({
  onOpenCVModal,
  onOpenGitHubModal,
}: {
  onOpenCVModal?: () => void;
  onOpenGitHubModal?: () => void;
}) {
  const actions = [
    {
      title: "Add Developer",
      desc: "Manual profile creation",
      href: "/profiles/new",
      icon: UserPlus,
      color: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30",
    },
    {
      title: "Upload CV",
      desc: "PDF & Word parsing",
      href: "/profiles/new?mode=cv",
      icon: Upload,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
      onClick: onOpenCVModal,
    },
    {
      title: "Import GitHub",
      desc: "Fetch all repositories & CI",
      href: "/profiles/new?mode=github",
      icon: Github,
      color: "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30",
      onClick: onOpenGitHubModal,
    },
    {
      title: "Compare Devs",
      desc: "Matrix & practice diffs",
      href: "/compare",
      icon: GitCompare,
      color: "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400 border-fuchsia-500/30",
    },
    {
      title: "Create Job",
      desc: "Define target skills & weights",
      href: "/jobs/new",
      icon: PlusCircle,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Match to Job",
      desc: "Deterministic candidate ranking",
      href: "/jobs",
      icon: CheckSquare,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            Platform Workflows
          </h3>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">Quick Ingestion & Analysis</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              onClick={act.onClick}
              className="group p-3.5 rounded-xl border border-border/70 bg-card/70 hover:bg-muted/80 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between text-left space-y-3 shadow-sm dark:shadow-none"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center bg-gradient-to-br ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-foreground group-hover:text-violet-400 transition-colors block">
                  {act.title}
                </span>
                <span className="text-[10px] text-muted-foreground line-clamp-1 block mt-0.5">
                  {act.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
