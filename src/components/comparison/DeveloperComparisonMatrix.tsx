"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X, ShieldCheck, Code, GitCommit, FileText, ArrowRight, FolderGit2, CheckCircle2, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface ComparisonMatrixProps {
  profiles: Array<{
    id: string;
    name: string;
    headline?: string | null;
    completeness: number;
    topSkills: string[];
    experiencesCount: number;
    projectsCount: number;
    evidenceCount: number;
  }>;
  skillMatrix: Array<{
    skillName: string;
    category: string;
    developerPresence: Array<{
      developerId: string;
      developerName: string;
      hasSkill: boolean;
      status: string;
      proficiency?: string | null;
    }>;
  }>;
  engineeringMatrix: Array<{
    developerId: string;
    developerName: string;
    totalProjects: number;
    testedProjectsCount: number;
    ciEnabledCount: number;
    documentedCount: number;
    averageComplexityScore: number;
    totalVerifiedEvidenceCount: number;
  }>;
}

export function DeveloperComparisonMatrix({
  profiles,
  skillMatrix,
  engineeringMatrix,
}: ComparisonMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const categories = ["ALL", ...Array.from(new Set(skillMatrix.map((s) => s.category)))];

  const filteredSkills = skillMatrix.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch = item.skillName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Bento Profile Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(profiles.length, 3)} gap-4`}>
        {profiles.map((p) => (
          <div key={p.id} className="bento-card p-5 space-y-4 hover:border-violet-500/40 transition-all">
            <div className="space-y-1">
              <Link
                href={`/profiles/${p.id}`}
                className="text-base font-bold text-foreground hover:text-violet-400 transition-colors block"
              >
                {p.name}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-1">{p.headline || "Software Engineer"}</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 font-mono">
                <span>Profile Completeness</span>
                <span className="font-semibold text-foreground">{Math.round(p.completeness)}%</span>
              </div>
              <Progress value={p.completeness} className="h-1.5 bg-muted dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70 dark:border-white/5 text-center font-mono">
              <div className="p-2 rounded-lg bg-muted/40 border border-border/70 dark:bg-white/[0.03] dark:border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase block">Repos</span>
                <span className="font-bold text-xs text-foreground flex items-center justify-center gap-1">
                  <FolderGit2 className="w-3 h-3 text-violet-500 dark:text-violet-400" /> {p.projectsCount}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border border-border/70 dark:bg-white/[0.03] dark:border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase block">Roles</span>
                <span className="font-bold text-xs text-foreground">{p.experiencesCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/40 border border-border/70 dark:bg-white/[0.03] dark:border-white/5">
                <span className="text-[10px] text-muted-foreground uppercase block">Evidence</span>
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{p.evidenceCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Engineering Practice Discipline Bento Matrix */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-foreground tracking-tight">
              Engineering Practice Discipline Comparison
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Observable Evidence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/70 dark:border-white/10 text-muted-foreground font-mono">
                <th className="py-2.5 px-3 font-semibold">Engineering Dimension</th>
                {engineeringMatrix.map((em) => (
                  <th key={em.developerId} className="py-2.5 px-3 font-semibold text-foreground">
                    {em.developerName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-white/5 font-mono">
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-foreground">Automated Test Suites</td>
                {engineeringMatrix.map((em) => (
                  <td key={em.developerId} className="py-3 px-3">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{em.testedProjectsCount}</span>
                    <span className="text-muted-foreground text-[11px]"> of {em.totalProjects} repos</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-foreground">CI/CD Pipeline Workflows</td>
                {engineeringMatrix.map((em) => (
                  <td key={em.developerId} className="py-3 px-3">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{em.ciEnabledCount}</span>
                    <span className="text-muted-foreground text-[11px]"> of {em.totalProjects} repos</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-foreground">Technical Complexity Index</td>
                {engineeringMatrix.map((em) => (
                  <td key={em.developerId} className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/80 dark:bg-white/[0.04] dark:border-white/10 font-bold text-violet-600 dark:text-violet-400">
                      {em.averageComplexityScore}/100
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans font-medium text-foreground">Verified Traceable Claims</td>
                {engineeringMatrix.map((em) => (
                  <td key={em.developerId} className="py-3 px-3">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{em.totalVerifiedEvidenceCount}</span>
                    <span className="text-muted-foreground text-[11px]"> auditable claims</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Skill Union Bento Matrix */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-violet-500 dark:text-violet-400" />
            <h3 className="font-bold text-base text-foreground tracking-tight">
              Technical Skill Union Matrix ({filteredSkills.length} skills)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Filter skill..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-md border border-border bg-background dark:border-white/10 dark:bg-black/40 text-foreground h-8 focus:outline-none focus:border-violet-500"
            />
            <div className="flex items-center gap-1 flex-wrap">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/70 dark:border-white/10 text-muted-foreground font-mono">
                <th className="py-2.5 px-3 font-semibold">Canonical Skill</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                {profiles.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 font-semibold text-foreground">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-white/5">
              {filteredSkills.map((item) => (
                <tr key={item.skillName} className="hover:bg-muted/40 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-foreground">{item.skillName}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-[11px] font-mono">{item.category}</td>
                  {item.developerPresence.map((dp) => (
                    <td key={dp.developerId} className="py-2.5 px-3">
                      {dp.hasSkill ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              dp.status === "VERIFIED"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "bg-muted/70 border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300"
                            }`}
                          >
                            {dp.status === "VERIFIED" ? "Verified" : "Claimed"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
