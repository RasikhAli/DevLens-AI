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
  Sliders,
  Scale,
  Search,
  CheckCircle2,
  Zap,
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
            <Link href="/sign-up">
              <Button variant="outline" size="sm" className="text-xs font-semibold border-border hover:border-violet-500/40">Sign Up</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="shimmer-button text-white text-xs font-semibold gap-1.5 shadow-lg shadow-violet-500/20">
                Launch Platform <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Static Hexagonal Lattice Grid & Interactive Click Ripple */}
      <section className="relative py-20 md:py-32 px-6 overflow-hidden border-b border-border/40 dark:border-white/5 cursor-pointer">
        <div className="absolute inset-0 opacity-80 dark:opacity-85">
          <M
            cellSize={0.75}
            lineWidth={0.4}
            litWidth={2.4}
            glow={2.85}
            glowRadius={0.5}
            core={0.03}
            flow={0}
            shimmer={0}
            autoplay={false}
            clickPulses={true}
            interactive={true}
            className="w-full h-full cursor-pointer"
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

      {/* SECTION 1: Dark Bento UI Showcase (#bento) */}
      <section id="bento" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto w-full space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <ShimmerBadge variant="neutral">Dark Bento Architecture</ShimmerBadge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Modular Monolith Architecture
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Engineered with strict data boundaries, SSRF-hardened ingestion, and multi-source evidence unification.
          </p>
        </div>

        <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Multi-Source Ingestion */}
          <BentoCard colSpan={2} gradient className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-violet-600 dark:text-violet-400 uppercase font-semibold">
                Multi-Source Ingestion Gateway
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono">
                100% Repositories Scanned
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Ingest CVs, Portfolios, and Every Public GitHub Repository
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              Unlike legacy tools that scrape only a handful of repositories, DevLens AI fetches all public repositories, analyzes primary languages, inspects automated test configurations (Jest, Vitest, PyTest), and verifies continuous delivery pipelines (.github/workflows).
            </p>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/70 dark:border-white/10 font-mono text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">PDF / DOCX</span>
                <span className="font-bold text-foreground">Parser Extraction</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">GitHub REST</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">All Repos + CI/CD</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70 dark:bg-black/40 dark:border-white/5">
                <span className="text-[10px] text-muted-foreground block">Portfolio</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">SSRF Hardened</span>
              </div>
            </div>
          </BentoCard>

          {/* Bento Card 2: Security & Isolation */}
          <BentoCard colSpan={1} className="space-y-4">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
              Security & Isolation
            </span>

            <h3 className="text-xl font-bold text-foreground tracking-tight">
              SSRF Defense Gateway
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated validation prevents internal network scans, private IP spoofing (AWS/GCP metadata), and enforces protocol whitelists.
            </p>

            <div className="space-y-2 pt-2 border-t border-border/70 dark:border-white/10 text-xs font-mono">
              <div className="p-2.5 rounded-md bg-muted/30 border border-border/50 text-[11px] space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DNS & Subnet Resolution
                </div>
                <div className="text-muted-foreground text-[10px]">Private range 10.x, 172.16.x, 192.168.x blocked</div>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* SECTION 2: Workflows (#workflows) */}
      <section id="workflows" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto w-full space-y-12 relative z-10 border-t border-border/40 dark:border-white/5">
        <div className="text-center space-y-2">
          <ShimmerBadge variant="primary">Platform Workflows</ShimmerBadge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Three Unified Evaluation Workflows
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            From side-by-side engineer comparisons to mathematical multi-candidate pool ranking and skill growth roadmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workflow 1 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl space-y-4 shadow-sm hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <GitCompare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold block">Workflow 01</span>
            <h3 className="text-lg font-bold text-foreground">Developer vs. Developer Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Compare technical skill overlap, code complexity indices, testing practices, and repo depth side-by-side without forced arbitrary winners.
            </p>
            <div className="pt-2 border-t border-border/60 dark:border-white/5 text-[11px] font-mono text-muted-foreground space-y-1">
              <div>• Radar Visualizer Chart</div>
              <div>• Skill Overlap &amp; Differences</div>
              <div>• Test Suite &amp; CI/CD Audit</div>
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl space-y-4 shadow-sm hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold block">Workflow 02</span>
            <h3 className="text-lg font-bold text-foreground">Candidate vs. Job Matching</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rank candidate pools against job specifications with dynamic real-time criteria weight sliders and downloadable CSV audit compliance reports.
            </p>
            <div className="pt-2 border-t border-border/60 dark:border-white/5 text-[11px] font-mono text-muted-foreground space-y-1">
              <div>• Dynamic Weight Sliders (0-100%)</div>
              <div>• Ranked Leaderboard Scoring</div>
              <div>• Auditable Export (CSV / JSON)</div>
            </div>
          </div>

          {/* Workflow 3 */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl space-y-4 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold block">Workflow 03</span>
            <h3 className="text-lg font-bold text-foreground">Growth Gap &amp; Upskilling Analyzer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identify missing technologies, untracked testing habits, and provide actionable evidence-backed onboarding roadmaps for incoming engineers.
            </p>
            <div className="pt-2 border-t border-border/60 dark:border-white/5 text-[11px] font-mono text-muted-foreground space-y-1">
              <div>• Required vs Preferred Gaps</div>
              <div>• Test Practice Recommendations</div>
              <div>• Onboarding Growth Vectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Evidence Trail (#evidence) */}
      <section id="evidence" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto w-full space-y-12 relative z-10 border-t border-border/40 dark:border-white/5">
        <div className="text-center space-y-2">
          <ShimmerBadge variant="neutral">Audit-Ready Evidence</ShimmerBadge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Verifiable Evidence Provenance Trail
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Every claimed skill and evaluation score links directly to verifiable repository commits, automated tests, and source excerpts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> 5-Tier Verification Taxonomy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">Immutable</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              DevLens AI categorizes skills based on proven provenance rather than self-reported resume bullet points:
            </p>
            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">SOURCE_OBSERVED</span>
                <span className="text-[10px] text-muted-foreground">Found in test configs, CI, or code files (1.0x Credit)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">USER_CONFIRMED</span>
                <span className="text-[10px] text-muted-foreground">Validated during technical assessment (1.0x Credit)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-violet-500/30 bg-violet-500/10 flex items-center justify-between">
                <span className="font-bold text-violet-600 dark:text-violet-400">INFERRED</span>
                <span className="text-[10px] text-muted-foreground">Derived from dependency graphs (0.75x Credit)</span>
              </div>
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
                <span className="font-bold text-amber-600 dark:text-amber-400">CLAIMED</span>
                <span className="text-[10px] text-muted-foreground">Mentioned in CV without code proof (0.5x Credit)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl space-y-4 shadow-sm">
            <span className="text-xs font-mono uppercase font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4" /> Live Codebase Inspection Signal
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent proof extracted directly from candidate repositories:
            </p>

            <div className="p-4 rounded-xl bg-muted/40 dark:bg-black/50 border border-border/80 dark:border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-foreground font-semibold">auth-microservice</span>
                <span className="text-[10px] text-emerald-500 font-bold">4 Passing Test Suites</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                "Jest &amp; Supertest detected in package.json. CI workflow active in .github/workflows/deploy.yml with 98% pass rate."
              </p>
              <div className="flex gap-2 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-500">TypeScript</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">Docker</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">CI/CD Verified</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/70 dark:border-white/5 bg-card/60 text-xs text-muted-foreground">
              🛡️ Audit records are stored with immutable timestamps and can be exported as legal compliance artifacts.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Deterministic Scoring (#scoring) */}
      <section id="scoring" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto w-full space-y-12 relative z-10 border-t border-border/40 dark:border-white/5">
        <div className="text-center space-y-2">
          <ShimmerBadge variant="primary">Mathematical Integrity</ShimmerBadge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            100% Deterministic Mathematical Scoring Formula
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Objective mathematical formulas calculate candidate scores with full auditability—zero LLM hallucinations.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-border/80 bg-card/90 dark:border-white/10 dark:bg-zinc-950/80 backdrop-blur-xl shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-violet-600 dark:text-violet-400 font-semibold uppercase">The Scoring Equation</span>
            <div className="p-4 rounded-xl bg-muted/40 dark:bg-black/60 border border-border/70 dark:border-white/10 font-mono text-sm sm:text-base font-bold text-foreground">
              Total Score = ∑ [ RawScore(c) × ( Weight(c) / 100 ) ]
            </div>
            <p className="text-xs text-muted-foreground">
              Scores are calculated deterministically across 5 independent vectors with user-configurable weights:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 dark:bg-zinc-900/40 dark:border-white/5 space-y-2">
              <span className="text-[10px] text-violet-500 font-bold block uppercase">Vector 1 (Default: 40%)</span>
              <div className="font-bold text-foreground text-sm">Technical Skills</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Matches verified (1.0x) and claimed (0.5x) skills against required (1.0x) &amp; preferred (0.5x).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 dark:bg-zinc-900/40 dark:border-white/5 space-y-2">
              <span className="text-[10px] text-cyan-500 font-bold block uppercase">Vector 2 (Default: 20%)</span>
              <div className="font-bold text-foreground text-sm">Project Relevance</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Technology overlap, repository complexity scores, and open source repository stars.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 dark:bg-zinc-900/40 dark:border-white/5 space-y-2">
              <span className="text-[10px] text-fuchsia-500 font-bold block uppercase">Vector 3 (Default: 20%)</span>
              <div className="font-bold text-foreground text-sm">Experience Tenure</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Mathematical ratio of documented experience years vs job minimum tenure requirements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 dark:bg-zinc-900/40 dark:border-white/5 space-y-2">
              <span className="text-[10px] text-emerald-500 font-bold block uppercase">Vector 4 (Default: 15%)</span>
              <div className="font-bold text-foreground text-sm">Engineering Habits</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Verifiable test suites (+10 pts per repo) and active automated CI/CD workflows (+5 pts).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/70 dark:bg-zinc-900/40 dark:border-white/5 space-y-2">
              <span className="text-[10px] text-amber-500 font-bold block uppercase">Vector 5 (Default: 5%)</span>
              <div className="font-bold text-foreground text-sm">Domain Fit</div>
              <p className="text-[11px] text-muted-foreground font-sans">
                Specialized industry domains and sector-specific requirements matching.
              </p>
            </div>
          </div>
        </div>
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
