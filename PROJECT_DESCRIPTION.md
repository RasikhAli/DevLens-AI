# DevLens AI — Comprehensive Project Description

> **Understand Skills. Compare Evidence. Find the Right Match.**

---

## 1. Executive Summary & Vision

**DevLens AI** is an enterprise-grade Developer Profile Analyzer, Technical Skills Assessment, Developer Comparison, and Job Matching Platform. Built as a single unified modular monolith in **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, DevLens AI eliminates hiring subjectivity and LLM hallucinations by combining **automated evidence extraction** with a **100% deterministic mathematical scoring engine**.

Traditional hiring tools rely either on keyword matching (which favors buzzword-stuffed CVs) or generative AI summaries (which hallucinate ratings and lack explainability). DevLens AI introduces a third paradigm: **verifiable engineering evidence**. It ingests candidate CVs, all public GitHub repositories, and portfolio websites, extracts concrete proof (test suites, CI pipelines, architectural complexity, code excerpts), and maps them into an auditable evidence trail.

---

## 2. Core Workflows & Functional Capabilities

### Workflow 1: Developer vs. Developer Comparison
- **Multi-Candidate Differential Matrix**: Compare two or more developers across technical skills, repository depth, test suite presence, and CI/CD automation.
- **No Forced Single Winner**: Evaluates distinct engineering trade-offs (e.g., strong backend infrastructure vs. comprehensive frontend state architecture) without arbitrary reductionism.
- **Visual Radar Chart**: Multi-axis technical taxonomy mapping powered by SVG radar visualizers.

### Workflow 2: Multiple Developers vs. Job Description
- **100% Deterministic Mathematical Scoring**: Candidates are ranked strictly using an algebraic formula across five configurable dimensions:
  1. **Technical Skills Alignment (Default: 40%)**: Ratio of verified vs. claimed skills against required and preferred job criteria.
  2. **Project Relevance & Depth (Default: 20%)**: Technology overlap, star count, and architectural complexity index.
  3. **Experience Alignment (Default: 20%)**: Years of experience relative to minimum job tenure.
  4. **Engineering Practices (Default: 15%)**: Real test suite presence (Jest, Vitest, Pytest) and active CI/CD workflows (GitHub Actions).
  5. **Domain & Other Requirements (Default: 5%)**: Specialized domain criteria (e.g., distributed systems, fintech).
- **Dynamic Real-Time Weight Tuning**: Hiring teams can adjust category weight sliders on the fly; candidate scores and rank orders re-calculate instantaneously in the browser.
- **Auditable Evidence Coverage**: Every score displays an **Evidence Coverage %**, detailing exactly how much of the candidate's profile is grounded in observable artifacts versus unverified claims.

### Workflow 3: Developer vs. Job Growth Analysis
- **Targeted Gap Identification**: Pinpoints missing skills, unverified technologies, and unobserved engineering practices.
- **Evidence-Backed Recommendations**: Outlines tangible production projects (with automated testing and CI) to help candidates demonstrate missing competencies.

---

## 3. Role-Based Access Control (RBAC) & Administration

DevLens AI features a multi-role authentication system enforced at both the API Route Handler level and the UI layer:

| Role | Default Account | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@devlens.ai` | `Admin@123` | **Full Authority**: Add & delete developer profiles, add & delete job descriptions, manage & delete audit reports, view system audit logs. |
| **Recruiter** | `demo@devlens.ai` | `Demo@123` | **Standard Evaluation**: Ingest candidate CVs/GitHub profiles, create job requisitions, execute comparisons, run candidate matchings. |
| **Viewer** | `viewer@devlens.ai` | `Viewer@123` | **Read-Only**: Inspect candidate dossiers, review rankings, export reports. Destructive actions are strictly blocked. |

### Administrative Safeguards:
- **Profile Deletion**: Dedicated delete actions on both candidate cards and detail dossiers with interactive two-step confirmation modals.
- **Batch Deletion**: Capability to select multiple candidates and delete them in a single batch operation.
- **Job & Report Archival**: Full CRUD lifecycle control over open requisitions and generated audit archives.

---

## 4. Multi-Source Ingestion & Evidence Extraction

1. **CV & Resume Ingestion**:
   - Parses PDF (`pdf-parse`) and DOCX (`mammoth`) documents with a robust offline heuristic fallback.
   - Extracts candidate summary, work history, skill claims, and education.
2. **GitHub Ingestion**:
   - Ingests **all public repositories** (not just a token subset).
   - Inspects test suites (identifying `jest.config`, `vitest.config`, `pytest.ini`, test files).
   - Identifies CI/CD pipelines (`.github/workflows/` files).
   - Computes repository complexity indices based on language diversity, star count, and test presence.
3. **Portfolio & Web Ingestion**:
   - Scrapes portfolio websites and personal domains.
   - Extracts live project URLs, case studies, and demonstrated tech stacks.
4. **SSRF Hardening**:
   - Every external URL fetch passes through strict IP address validation.
   - Blocks private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`), and cloud metadata endpoints (`169.254.169.254`).
5. **Anti-Bias Safeguards**:
   - Completely strips photos, gender indicators, age assumptions, and non-job criteria from evaluation algorithms.

---

## 5. UI/UX Design System: Cybernetic Hexagonal Vault & Dark Bento

DevLens AI delivers a human-crafted aesthetic inspired by high-end developer tools (Linear, Raycast, Vercel, Supabase):

- **Hexagonal Vault Canvas Component**:
  - Implements the ReactBits Pro Hexagonal Vault architecture (`<M ... />`).
  - **Mono Palette for Dark Mode**: Luminous `#8A8A99` and `#FFFFFF` nodes with deep obsidian vault glow.
  - **Graphite Palette for Light Mode**: `#64748B` and `#0F172A` graphite lines with zero light-mode glare.
  - **Configured Parameters**:
    - `cellSize: 0.75` | `lineWidth: 0.30px` | `litWidth: 2.4px` | `lattice: 0.10`
    - `glow: 2.85` | `glowRadius: 0.50` | `core: 0.03` | `vignette: 0.00` | `grain: 0.00`
    - `trailLength: 1.7s` | `trailWidth: 0.80` | `follow: 0.90` | `flow: 0.98`
    - `shimmer: 1.20` | `speed: 1.45` | `pulseSpeed: 0.55` | `seed: 0`
    - `autoplay: true` | `interactive: true` | `clickPulses: true` (shockwave ripples on click) | `paused: false`
  - **60 FPS Hardware-Accelerated Performance**: Offscreen canvas pre-rendering and spatially bounded cell updates eliminate canvas overhead and eliminate lag.
  - **Micro-Core Nodes & Shimmer Waves**: Features glowing central nodes (`core={0.03}`) and organic wave shimmer (`shimmer={1.2}`, `pulseSpeed={0.55}`).
- **Dark Bento UI Architecture**:
  - Information-dense cards with 1px precision borders (`border-border/70`, `dark:border-white/10`).
  - Monospace telemetry badges for repositories, test counts, evidence tokens, and commit hashes.
  - Seamless Light / Dark theme transitions with zero unstyled flash.

---

## 6. Verification & Quality Assurance

- **Unit Testing**: 20/20 Vitest unit test suite covering:
  - SSRF private IP blocking and cloud metadata protection.
  - Deterministic mathematical scoring calculations.
  - AI abstraction providers and fallback engines.
  - GitHub repository parsing and normalization.
  - Authentication hashing and session security.
- **Production Compilation**: 100% clean Next.js 15 production build (`next build`) across all 23 static and dynamic routes.
