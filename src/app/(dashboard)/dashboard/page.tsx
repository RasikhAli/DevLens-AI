import React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProfileCard } from "@/components/profiles/ProfileCard";
import { ShimmerBadge, BentoCard } from "@/components/ui/bento-grid";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Plus, Users, ShieldCheck, CheckCircle2, FolderGit2, Sparkles } from "lucide-react";
import { dbStore } from "@/lib/data/store";
import { M } from "@/components/ui/hexagonal-vault";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = dbStore.getMetrics("demo-user-1");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground bg-dot-pattern">
      <AppHeader title="Executive Overview" />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Header Banner with Static Hexagonal Grid */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 dark:border-white/10 bg-card/85 dark:bg-zinc-950/80 p-6 md:p-8 backdrop-blur-xl shadow-sm">
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-45">
            <M
              cellSize={0.75}
              lineWidth={0.4}
              flow={0}
              shimmer={0}
              autoplay={false}
              clickPulses={false}
              interactive={true}
              className="w-full h-full pointer-events-auto"
            />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pointer-events-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Technical Evidence Hub
                </h2>
                <ShimmerBadge variant="primary">
                  <Sparkles className="w-3 h-3" /> Live Audit Engine
                </ShimmerBadge>
              </div>
              <p className="text-xs text-muted-foreground">
                Multi-source candidate profiles with all repositories fetched, auditable evidence trails, and deterministic job matching.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/profiles/new">
                <Button size="sm" className="shimmer-button text-white text-xs gap-1.5 shadow-md">
                  <Plus className="w-3.5 h-3.5" /> Ingest New Candidate
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 1. Metrics Bento Strip */}
        <MetricsCards metrics={metrics} />

        {/* 2. Quick Actions Bento Tile */}
        <QuickActions />

        {/* 3. Main Dashboard Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Profiles Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-sm text-foreground">Candidate Profiles</h3>
              </div>
              <Link href="/profiles" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all ({metrics.totalProfiles}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.recentProfiles.map((p) => (
                <ProfileCard key={p.id} profile={p} />
              ))}
            </div>
          </div>

          {/* Active Job Requirements Column (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-foreground">Active Roles</h3>
              </div>
              <Link href="/jobs" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                Manage ({metrics.totalJobs}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.recentJobs.map((job) => (
                <div key={job.id} className="bento-card p-4 space-y-3 hover:border-cyan-500/40 transition-all">
                  <div className="space-y-1">
                    <Link
                      href={`/jobs/${job.id}/match`}
                      className="font-bold text-sm text-foreground hover:text-cyan-400 transition-colors block"
                    >
                      {job.title}
                    </Link>
                    {job.company && (
                      <p className="text-[11px] text-muted-foreground font-medium">{job.company}</p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-1 flex-wrap">
                    {job.requiredSkills.slice(0, 4).map((req) => (
                      <span
                        key={req}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/70 border border-border text-foreground dark:bg-white/[0.04] dark:border-white/10 dark:text-zinc-300"
                      >
                        {req}
                      </span>
                    ))}
                  </div>

                  <Link href={`/jobs/${job.id}/match`} className="block pt-1">
                    <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5 bg-transparent border-border dark:border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                      Match Candidates
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
