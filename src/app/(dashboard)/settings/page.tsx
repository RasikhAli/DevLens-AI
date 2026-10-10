import React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Cpu, Github, Lock, CheckCircle2, Sliders, Database } from "lucide-react";
import { env } from "@/lib/env";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Platform Settings & Governance" />

      <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Configuration & Compliance Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage provider integrations, token limits, and deterministic evaluation parameters.
          </p>
        </div>

        {/* 1. AI Provider Engine Status */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-semibold">AI Integration Layer</CardTitle>
              </div>
              <Badge variant="success" className="font-mono text-xs">
                Active: {env.AI_PROVIDER.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Provider-independent architecture. AI assists with document extraction and semantic relation; scoring remains 100% deterministic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
              <div className="font-semibold text-foreground">Provider Mode: {env.AI_PROVIDER}</div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {env.AI_PROVIDER === "mock"
                  ? "Running in zero-friction offline/development mode using deterministic pattern extraction and Zod schema validation. Fully operational without external API keys."
                  : `Configured with ${env.AI_PROVIDER} using model ${env.AI_MODEL}.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 2. GitHub REST Integration */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-indigo-500" />
                <CardTitle className="text-base font-semibold">GitHub REST API Integration</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {env.GITHUB_TOKEN ? "Authenticated (5,000 req/hr)" : "Public (60 req/hr)"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Inspects public repositories, CI workflows, and testing frameworks with rate-limit guards.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              To expand hourly rate limits for large candidate pools, set <code className="font-mono px-1 py-0.5 rounded bg-muted text-foreground">GITHUB_TOKEN</code> in your local <code className="font-mono">.env</code> file.
            </p>
          </CardContent>
        </Card>

        {/* 3. Security, Privacy & Ethical Guardrails */}
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Ethical Scoring & Privacy Governance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                <span className="font-semibold text-foreground block">Zero Demographic Bias Policy</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  DevLens AI evaluates verifiable code and document evidence exclusively. Protected attributes (age, race, gender, photos) are strictly excluded from calculations.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                <span className="font-semibold text-foreground block">SSRF & Network Shield</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Portfolio website scraper validates IP subnets and DNS resolution, blocking RFC1918 private IPs, AWS metadata endpoints, and internal infrastructure.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All platform scoring weights and calculations are unit-tested and independently auditable.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
