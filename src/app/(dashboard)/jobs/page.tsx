import React from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, CheckCircle2, ArrowRight, Sliders, Calendar } from "lucide-react";
import { dbStore } from "@/lib/data/store";
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton";

export const dynamic = "force-dynamic";

export default async function JobsListPage() {
  const jobs = dbStore.getJobs("demo-user-1");

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <AppHeader title="Job Requirements & Matching" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-2">
              <Briefcase className="w-3 h-3" /> Deterministic Role Benchmarks
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Open Positions ({jobs.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define target skills, domain requirements, and weights to evaluate candidate pools deterministically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/jobs/new">
              <Button size="sm" className="shimmer-button text-xs gap-1.5 h-9 px-4">
                <Plus className="w-3.5 h-3.5" /> Define New Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bento-card group rounded-2xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      <Link href={`/jobs/${job.id}/match`} className="hover:text-violet-400 transition-colors">
                        {job.title}
                      </Link>
                    </h3>
                    {job.company && (
                      <p className="text-xs mt-0.5 font-medium text-muted-foreground">
                        {job.company}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0 border-border/80 bg-muted/60 text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                    {job.requiredExperience}+ yrs exp
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    Required Skills:
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] px-2.5 py-1 rounded-md font-mono bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {job.preferredSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      Preferred:
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.preferredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[10px] px-2.5 py-1 rounded-md font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-5 border-t border-border/70 dark:border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sliders className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                  <span>Configured Weights Active</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/jobs/${job.id}/match`}>
                    <Button size="sm" className="shimmer-button text-xs gap-1.5 h-8 px-3.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Match Candidates <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
