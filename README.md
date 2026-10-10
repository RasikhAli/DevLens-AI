# DevLens AI

> **Understand Skills. Compare Evidence. Find the Right Match.**

DevLens AI is a professional, AI-powered Developer Profile Analyzer, Technical Skills Assessment, Developer Comparison, and Job Matching Platform. Built as a unified full-stack modular monolith using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 📸 Visual Showcase & Platform Panels

### 1. Interactive Landing Page Hero (Hexagonal Vault)
Features the ReactBits Pro **Hexagonal Vault** canvas with **60 FPS** hardware acceleration, instant cursor trailing, and dual-mode palette adaptation:

| Dark Mode ("Mono" Palette: `#8A8A99` / `#FFFFFF` with Glowing Cores) | Light Mode ("Graphite" Palette: `#64748B` / `#0F172A`) |
| :---: | :---: |
| ![Hero Dark Mode](docs/screenshots/hero_dark_mode_1791592659208.png) | ![Hero Light Mode](docs/screenshots/hero_light_mode_1791592695700.png) |

*Cursor Trail & Shimmer Illumination:*
![Interactive Trail](docs/screenshots/interactive_illumination_1791592664889.png)

---

### 2. Executive Dashboard & Technical Evidence Hub
Bento grid overview displaying ingestion metrics, verified skills, and candidates:

| Dark Mode Dashboard | Light Mode Dashboard |
| :---: | :---: |
| ![Dashboard Dark](docs/screenshots/dashboard_banner_1791592737316.png) | ![Dashboard Light](docs/screenshots/dashboard_light_mode_1791588736179.png) |

---

### 3. Candidate Dossier & Ingested Repositories Bento
Comprehensive developer profile with all public repositories ingested, automated test suite indicators, CI/CD status, and architectural complexity scores:

| Developer Overview & All Repositories | Work History & Traceable Evidence Trail |
| :---: | :---: |
| ![Profile Dossier](docs/screenshots/sarah_chen_profile_1791585814280.png) | ![Profile Evidence](docs/screenshots/sarah_chen_profile_evidence_1791585835501.png) |

---

### 4. Developer vs. Developer Comparison Matrix
Side-by-side comparison across technical skills, repository depth, test suite presence, and CI/CD pipelines:

![Developer Comparison](docs/screenshots/compare_page_1791585865907.png)

---

### 5. Deterministic Candidate-to-Job Matching
100% mathematical scoring with real-time dynamic weight sliders and downloadable CSV audit reports:

![Job Match Ranking](docs/screenshots/job_match_ranking_1791586975605.png)

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[Sources: CVs, GitHub, Portfolios] --> B[SSRF-Hardened Ingestion Gateway]
    B --> C[Skill Normalizer & Taxonomies]
    C --> D[Evidence Extraction & Provenance Store]
    D --> E[Developer Dossier Database]
    E --> F[Workflow 1: Dev vs Dev Matrix]
    E --> G[Workflow 2: Candidate vs Job Matcher]
    E --> H[Workflow 3: Growth Gap Analyzer]
    G --> I[100% Deterministic Mathematical Scoring Engine]
    I --> J[Auditable Export: CSV / JSON / PDF]
```

### Ingestion & Evidence Trail Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Recruiter / Admin
    participant Gateway as Ingestion Gateway
    participant GitHub as GitHub API / CV Parser
    participant Evidence as Evidence Verifier
    participant Store as State Store
    participant UI as Dark Bento UI

    User->>Gateway: Submit Candidate (CV or GitHub)
    Gateway->>Gateway: Enforce SSRF & Domain Validation
    Gateway->>GitHub: Ingest All Public Repositories & Workflows
    GitHub-->>Gateway: Raw Repositories, Tests & Docs
    Gateway->>Evidence: Extract Skills & Test Suite Proof
    Evidence->>Store: Save Profile + Verifiable Evidence Trail
    Store-->>UI: Real-time Notification & Dossier Render
```

---

## 🛡️ Role-Based Access Control (RBAC) & Admin Accounts

DevLens AI features a multi-role authentication system:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@devlens.ai` | `Admin@123` | **Full Authority**: Add & delete developer profiles, add & delete job postings, delete audit reports, manage user permissions. |
| **Recruiter** | `demo@devlens.ai` | `Demo@123` | **Standard Evaluation**: Ingest candidates, run job matches, evaluate comparison matrices. |
| **Viewer** | `viewer@devlens.ai` | `Viewer@123` | **Read-Only**: View candidates, review rankings, export reports. Destructive actions are prohibited. |

---

## 🧮 100% Deterministic Scoring Formula

Candidate scores are calculated using transparent mathematical formulas—**free of LLM hallucinations**:

$$\text{Total Score} = \sum_{c} \left( \text{RawScore}_c \times \frac{\text{Weight}_c}{100} \right)$$

1. **Technical Skills Alignment (Default: 40%)**:
   - Compares verified skills ($1.0\times$ credit) and claimed skills ($0.5\times$ credit) against Required skills ($1.0\times$ weight) and Preferred skills ($0.5\times$ weight).
2. **Project Relevance & Depth (Default: 20%)**:
   - Evaluates technology overlap, repository complexity index, and star count.
3. **Experience Alignment (Default: 20%)**:
   - Evaluates documented tenure against minimum required tenure.
4. **Engineering Practices (Default: 15%)**:
   - Verifiable test suites ($10\text{ pts}$ per tested repo) and active CI/CD pipelines ($5\text{ pts}$ per CI workflow).
5. **Domain Requirements (Default: 5%)**:
   - Matches candidate background against specialized domain criteria.

---

## ⚡ Interactive Hexagonal Vault Canvas (ReactBits Pro)

The hero landing section and the dashboard executive overview feature high-performance GPU-accelerated canvas background grids tuned with the following engineering parameters:

```tsx
<HexagonalVault
  cellSize={0.75}         // Hexagon bounding cell scaling
  lineWidth={0.3}         // Grid wall stroke width (0.30px)
  litWidth={2.4}          // Active illumination radius (2.4px)
  lattice={0.10}          // Inter-cell border clearance
  glow={2.85}             // Exponential photon aura
  glowRadius={0.50}       // Radial decay cutoff
  core={0.03}             // Glowing hexagon center node
  vignette={0.00}         // Clean edge falloff
  grain={0.00}            // Crisp vector appearance
  trailLength={1.7}       // Mouse trajectory lifespan (1.7s)
  trailWidth={0.80}       // Particle trail stroke radius
  follow={0.90}           // Spring damping physics
  flow={0.98}             // Wave propagation phase
  shimmer={1.20}          // Periodic micro-sparkle amplitude
  speed={1.45}            // Simulation clock multiplier
  pulseSpeed={0.55}       // Breathing oscillation cycle
  seed={0}                // Deterministic pseudo-random seed
  autoplay={true}         // Ambient orbital idle motion
  interactive={true}      // Pointer hover reaction
  clickPulses={true}      // Radial shockwave ripples on pointer click
  paused={false}
/>
```

- **Dark Mode Palette (Mono)**: `#8A8A99` (Obsidian wireframe) & `#FFFFFF` (Photon core).
- **Light Mode Palette (Graphite)**: `#64748B` (Cool slate wireframe) & `#0F172A` (Deep graphite core).
- **Performance**: Pre-rendered offscreen canvas blit ensuring consistent 60 FPS under continuous pointer motion.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15+ (App Router), React 19, TypeScript (Strict Mode) |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Recharts (Radar Visualizer) |
| **Visual Effects** | Hexagonal Vault Canvas (ReactBits Pro), Dark Bento & Obsidian UI |
| **Database & ORM** | PostgreSQL, Prisma ORM, JSON-persisted state fallback |
| **Validation** | Zod (Runtime validation for profiles, jobs, scoring, config) |
| **Authentication** | JWT Session Cookie, bcrypt password hashing |
| **Ingestion** | `pdf-parse`, `mammoth`, GitHub REST API, Cheerio (SSRF hardened) |
| **Testing** | Vitest (20/20 Passing Unit & Integration Tests) |


---

## 🚀 Getting Started

### 1. Installation
```bash
git clone <repo-url> devlens-ai
cd devlens-ai
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Production Build
```bash
npm run build
npm start
```

### 5. Run Test Suite
```bash
npm test
```
All 20 unit tests pass across SSRF validation, mathematical scoring, AI abstraction, GitHub parsing, and authentication hashing.
