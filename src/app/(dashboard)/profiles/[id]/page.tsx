import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProfileSourceBadge } from "@/components/profiles/ProfileSourceBadge";
import { EvidenceDrawer } from "@/components/profiles/EvidenceDrawer";
import { DeleteProfileButton } from "@/components/profiles/DeleteProfileButton";
import { ProfileAnalyticsHub } from "@/components/profiles/ProfileAnalyticsHub";
import { ProfileRepositoryExplorer } from "@/components/profiles/ProfileRepositoryExplorer";
import { SkillRadarChart } from "@/components/charts/SkillRadarChart";
import { ShimmerBadge } from "@/components/ui/bento-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  Github,
  Linkedin,
  Mail,
  ShieldCheck,
  GitCompare,
  Briefcase,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  FolderGit2,
  CheckCircle2,
  Cpu,
  Sparkles,
  Download,
  Terminal,
} from "lucide-react";
import { dbStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = dbStore.getProfileById(id);

  if (!profile) {
    notFound();
  }

  const verifiedSkillsCount = profile.skills.filter((s) => s.evidenceStatus === "VERIFIED").length;
  const testedCount = profile.projects.filter((p) => p.hasTests).length;
  const ciCount = profile.projects.filter((p) => p.hasCI).length;
  const avgComplexity = profile.projects.length
    ? Math.round(profile.projects.reduce((acc, p) => acc + (p.complexityScore || 50), 0) / profile.projects.length)
    : 0;

  // Group skills by category
  const skillsByCategory: Record<string, typeof profile.skills> = {};
  profile.skills.forEach((sk) => {
    const cat = sk.category || "General";
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(sk);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title={profile.name} />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Hero Bento Header Card */}
        <div className="bento-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black tracking-tight text-foreground">{profile.name}</h2>
                <ShimmerBadge variant="success">
                  <ShieldCheck className="w-3.5 h-3.5" /> {verifiedSkillsCount} Verified Skills
                </ShimmerBadge>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-muted/60 border border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-muted-foreground">
                  {profile.projects.length} Repositories Ingested
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold">
                  {profile.completeness}% Audit Complete
                </span>
              </div>

              <p className="text-base font-medium text-foreground/90">{profile.headline || "Software Engineer"}</p>
              {profile.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{profile.summary}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1 font-mono">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
                  </span>
                )}
                {profile.githubUsername && (
                  <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-foreground text-violet-600 dark:text-violet-400 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" /> github.com/{profile.githubUsername}
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-foreground text-cyan-600 dark:text-cyan-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Portfolio Site
                  </a>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 flex-wrap">
              <Link href={`/compare?dev=${profile.id}`}>
                <Button variant="outline" size="sm" className="gap-2 text-xs h-9 bg-transparent border-border dark:border-white/10 hover:border-violet-500/40">
                  <GitCompare className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" /> Compare Profile
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="sm" className="gap-2 text-xs h-9 shimmer-button text-white font-semibold shadow-lg">
                  <Briefcase className="w-3.5 h-3.5" /> Evaluate for Job
                </Button>
              </Link>
              <DeleteProfileButton profileId={profile.id} profileName={profile.name} />
            </div>
          </div>
        </div>

        {/* 4-Column Bento Summary Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-card p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Repositories</span>
            <div className="text-2xl font-black font-mono text-foreground flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-violet-400" /> {profile.projects.length}
            </div>
            <p className="text-[10px] text-muted-foreground">All public repositories analyzed</p>
          </div>

          <div className="bento-card p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Automated Test Suites</span>
            <div className="text-2xl font-black font-mono text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {testedCount} repos
            </div>
            <p className="text-[10px] text-muted-foreground">Jest, Vitest, PyTest detected</p>
          </div>

          <div className="bento-card p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">CI/CD Workflows</span>
            <div className="text-2xl font-black font-mono text-cyan-400 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> {ciCount} repos
            </div>
            <p className="text-[10px] text-muted-foreground">GitHub Actions active</p>
          </div>

          <div className="bento-card p-4 space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Technical Complexity</span>
            <div className="text-2xl font-black font-mono text-fuchsia-400 flex items-center gap-2">
              <Layers className="w-5 h-5 text-fuchsia-400" /> {avgComplexity}/100
            </div>
            <p className="text-[10px] text-muted-foreground">Scope & architectural depth</p>
          </div>
        </div>

        {/* 1. DEEP DEVELOPER ANALYTICS HUB (Languages, Discipline Index, Complexity Tiers) */}
        <ProfileAnalyticsHub profile={profile} />

        {/* 2. INTERACTIVE REPOSITORY EXPLORER (Search, Filters, Flagships, Table/Grid, Pagination) */}
        <ProfileRepositoryExplorer projects={profile.projects} />

        {/* 3. CATEGORIZED SKILL TAXONOMY & AUDITABLE EVIDENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Column (2 cols) */}
          <div className="lg:col-span-2 bento-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/70 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h3 className="font-bold text-base text-foreground">
                  Audited Skill Competencies ({profile.skills.length})
                </h3>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {verifiedSkillsCount} Verified with Provenance
              </span>
            </div>

            {/* Categorized Skills Display */}
            <div className="space-y-5">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category} className="space-y-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                    {category} ({skills.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {skills.map((sk) => (
                      <div
                        key={sk.id}
                        className="p-3 rounded-xl border border-border/70 bg-muted/40 dark:border-white/5 dark:bg-white/[0.02] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-foreground block truncate">
                            {sk.canonicalName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {sk.claimedProficiency || "Mid"}
                          </span>
                        </div>
                        <Badge
                          variant={sk.evidenceStatus === "VERIFIED" ? "success" : "secondary"}
                          className="text-[10px] px-1.5 py-0 font-mono shrink-0"
                        >
                          {sk.evidenceStatus === "VERIFIED" ? "Verified" : "Claimed"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Documented Experience Timeline */}
            {profile.experiences.length > 0 && (
              <div className="pt-4 border-t border-border/70 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">
                    Work History & Career Evidence ({profile.experiences.length})
                  </h4>
                </div>

                <div className="divide-y divide-border/60 dark:divide-white/5">
                  {profile.experiences.map((exp) => (
                    <div key={exp.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{exp.title}</span>
                        <span className="text-muted-foreground font-mono text-[11px]">{exp.startDate || "Past"} – {exp.endDate || "Present"}</span>
                      </div>
                      <div className="text-violet-600 dark:text-violet-400 font-medium text-[11px]">{exp.employer}</div>
                      {exp.description && (
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Radar & Traceable Evidence Column (1 col) */}
          <div className="space-y-6">
            <div className="bento-card p-5 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Technical Competency Radar
              </span>
              <SkillRadarChart candidateName={profile.name} />
            </div>

            <EvidenceDrawer evidences={profile.evidences} />
          </div>
        </div>
      </div>
    </div>
  );
}
