import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShimmerBadge, SpotlightCard, BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import {
  Code2,
  ShieldCheck,
  GitCompare,
  Briefcase,
  Layers,
  ArrowRight,
  FileCheck2,
  Database,
  BarChart3,
  Cpu,
  FolderGit2,
  Sparkles,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { M } from "@/components/ui/hexagonal-vault";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden bg-dot-pattern">
      {/* Top Ambient Glow (Obsidian UI / React Bits style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-violet-600/20 via-fuchsia-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-border bg-card/70 dark:border-white/10 dark:bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-500 dark:text-violet-400 shadow-lg shadow-violet-500/10">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-foreground flex items-center gap-1.5">
              DevLens <span className="text-violet-600 dark:text-violet-400 font-mono text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <a href="#bento" className="hover:text-foreground transition-colors">Bento Architecture</a>
            <a href="#workflows" className="hover:text-foreground transition-colors">Workflows</a>
            <a href="#evidence" className="hover:text-foreground transition-colors">Evidence Trail</a>
            <a href="#scoring" className="hover:text-foreground transition-colors">Deterministic Scoring</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="shimmer-button text-white text-xs font-semibold gap-1.5 shadow-lg shadow-violet-500/20">
                Launch Platform <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive Hexagonal Vault (React Bits Pro) */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden border-b border-border/40 dark:border-white/5">
        <div className="absolute inset-0 pointer-events-none opacity-85 dark:opacity-90">
          <M
            cellSize={0.75}
            lineWidth={0.3}
            litWidth={2.4}
            lattice={0.1}
            glow={2.85}
            glowRadius={0.5}
            core={0.03}
            vignette={0}
            grain={0}
            trailLength={1.7}
            trailWidth={0.8}
            follow={0.9}
            flow={0.98}
            shimmer={1.2}
            speed={1.45}
            pulseSpeed={0.55}
            seed={0}
            autoplay={true}
            interactive={true}
            clickPulses={true}
            paused={false}
            className="w-full h-full pointer-events-auto"
          />
        </div>

        <div className="text-center max-w-5xl mx-auto space-y-7 relative z-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2">
            <ShimmerBadge variant="primary">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Developer Intelligence Platform
            </ShimmerBadge>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
            Understand Skills. Compare Evidence.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400">
              Find the Right Match.
            </span>
          </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          DevLens AI ingests candidate CVs, all GitHub public repositories, and portfolio sites into auditable profiles.
          Calculates objective job alignment using a <strong className="text-foreground">100% deterministic mathematical scoring engine</strong>—free of LLM hallucinations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="shimmer-button text-white text-sm font-bold gap-2 px-8 h-12 shadow-xl shadow-violet-500/25">
              Explore Live Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" size="lg" className="text-sm font-semibold gap-2 px-8 h-12 bg-card border-border hover:border-violet-500/40 text-foreground dark:bg-zinc-900/60 dark:border-white/10 dark:text-white">
              Try Candidate-to-Job Matching
            </Button>
          </Link>
        </div>

        {/* Live Metrics Strip */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-xl border border-border/80 bg-card/80 dark:border-white/10 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Full Ingestion</span>
            <div className="text-sm font-bold text-foreground mt-1">All Public Repos</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Tests, CI workflows, and docs</div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card/80 dark:border-white/10 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Audit-Ready</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">Traceable Evidence</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Auditable source excerpts</div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card/80 dark:border-white/10 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400">Pure Math</span>
            <div className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-1">Deterministic Scoring</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Unit-tested calculations</div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card/80 dark:border-white/10 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm dark:shadow-none">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Security Guard</span>
            <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1">SSRF Hardening</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Blocks private IP subnets</div>
          </div>
        </div>
      </div>
    </section>

      {/* Dark Bento UI Showcase (21st.dev / ObsidianUI style) */}
      <section id="bento" className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <ShimmerBadge variant="neutral">Dark Bento Architecture</ShimmerBadge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Designed for Technical Hiring Teams
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Modular monolith with auditable data boundaries, multi-source merging, and verifiable engineering signals.
          </p>
        </div>

        <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Multi-Source Ingestion */}
          <BentoCard colSpan={2} gradient className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-violet-600 dark:text-violet-400 uppercase font-semibold">
                Multi-Source Ingestion Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                All Repositories Fetched
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Ingest CVs, Portfolios, and Every Public GitHub Repository
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Unlike superficial tools that scrape only a handful of repositories, DevLens AI fetches all public repositories, analyzes primary languages, inspects automated test configurations (Jest, Vitest, PyTest), and verifies continuous delivery pipelines (.github/workflows).
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/70 dark:border-white/10 font-mono text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">PDF / DOCX</span>
                <span className="font-bold text-foreground">Structure Extraction</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">GitHub API</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">All Repos + CI/CD</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">Portfolio</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">SSRF Hardened</span>
              </div>
            </div>
          </BentoCard>

          {/* Bento Card 2: Deterministic Scoring */}
          <BentoCard colSpan={1} className="space-y-4">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
              Scoring Integrity
            </span>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              100% Deterministic Engine
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Mathematical scoring across 5 weighted dimensions. Transparent missing data policy distinguishes absence of evidence from verified failure.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/70 dark:border-white/10 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Technical Skills</span>
                <span className="text-violet-600 dark:text-violet-400 font-bold">35%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Project Relevance</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">25%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Experience Alignment</span>
                <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">20%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Engineering Practices</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">10%</span>
              </div>
            </div>
          </BentoCard>

          {/* Bento Card 3: Traceable Evidence */}
          <BentoCard colSpan={1} className="space-y-4">
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
              Verifiable Claims
            </span>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Auditable Evidence Trail
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Every skill and competency claim links directly to its source excerpt, repository commit, confidence score, and verification status.
            </p>

            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Source-Observed
              </span>
              <p className="text-[11px] text-muted-foreground italic">
                "Verified automated test suites in 4 public repositories and CI workflow in .github/workflows"
              </p>
            </div>
          </BentoCard>

          {/* Bento Card 4: Three Core Workflows */}
          <BentoCard colSpan={2} gradient className="space-y-4">
            <span className="text-xs font-mono text-fuchsia-600 dark:text-fuchsia-400 uppercase font-semibold">
              Three Unified Workflows
            </span>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Developer vs. Developer & Multi-Candidate Job Ranking
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5 space-y-1.5">
                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <GitCompare className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" /> Dev vs Dev Matrix
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Compare technical skill unions, code complexity, and testing habits side-by-side without arbitrary forced winners.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5 space-y-1.5">
                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> Multiple Devs vs Job
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Evaluate an entire candidate pool against job specifications with dynamic weights, ranking, and CSV exports.
                </p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6 bg-card dark:border-white/10 dark:bg-zinc-950 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            <span className="font-bold text-foreground">DevLens AI</span>
            <span>— Understand Skills. Compare Evidence. Find the Right Match.</span>
          </div>
          <div className="font-mono text-[11px]">
            Dark Bento UI • Next.js 15 Modular Monolith
          </div>
        </div>
      </footer>
    </div>
  );
}
