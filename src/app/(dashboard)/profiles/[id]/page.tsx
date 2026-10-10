import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProfileSourceBadge } from "@/components/profiles/ProfileSourceBadge";
import { EvidenceDrawer } from "@/components/profiles/EvidenceDrawer";
import { DeleteProfileButton } from "@/components/profiles/DeleteProfileButton";
import { SkillRadarChart } from "@/components/charts/SkillRadarChart";
import { ShimmerBadge } from "@/components/ui/bento-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Star,
  GitFork,
  CheckCircle2,
  Cpu,
  ArrowRight,
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

        {/* 4-Column Bento Summary Grid */}
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

        {/* ALL PROJECTS & REPOSITORIES BENTO GALLERY */}
        <div className="bento-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 dark:border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h3 className="font-bold text-lg text-foreground tracking-tight">
                  All Ingested Repositories & Projects ({profile.projects.length})
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every project and public repository retrieved and analyzed with observable test suites and CI workflows.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>{testedCount} tested</span>
              <span>•</span>
              <span>{ciCount} CI/CD active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.projects.map((proj) => (
              <div
                key={proj.id}
                className="group p-4 rounded-xl border border-border/70 bg-card/70 hover:bg-muted/60 dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] hover:border-violet-500/40 transition-all duration-300 flex flex-col justify-between space-y-3 shadow-sm dark:shadow-none"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                      {proj.name}
                    </span>
                    {proj.repositoryUrl && (
                      <a
                        href={proj.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground p-0.5"
                        title="Open Repository"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {proj.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/70 dark:border-white/5">
                  {/* Tech stack badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {proj.technologies.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/70 border border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                    {proj.technologies.length > 3 && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        +{proj.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Test & CI Indicator Pills */}
                  <div className="flex items-center justify-between text-[10px] pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      {proj.hasTests ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✓ Tests
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">No tests</span>
                      )}

                      {proj.hasCI && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold">
                          ✓ CI
                        </span>
                      )}
                    </div>

                    {proj.complexityScore && (
                      <span className="text-muted-foreground font-semibold">
                        Index: {proj.complexityScore}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SKILLS & EVIDENCE DUAL BENTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Column (2 cols) */}
          <div className="lg:col-span-2 bento-card p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-border/70 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                <h3 className="font-bold text-base text-foreground">
                  Technical Skill Taxonomy ({profile.skills.length})
                </h3>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {verifiedSkillsCount} Auditable Claims
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {profile.skills.map((sk) => (
                <div
                  key={sk.id}
                  className="p-3 rounded-xl border border-border/70 bg-muted/40 dark:border-white/5 dark:bg-white/[0.02] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{sk.canonicalName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{sk.category}</span>
                  </div>
                  <Badge
                    variant={sk.evidenceStatus === "VERIFIED" ? "success" : "secondary"}
                    className="text-[10px] px-1.5 py-0 font-mono"
                  >
                    {sk.evidenceStatus === "VERIFIED" ? "Verified" : "Claimed"}
                  </Badge>
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
                Technical Strength Radar
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
