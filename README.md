# DevLens AI

> **Understand Skills. Compare Evidence. Find the Right Match.**

DevLens AI is an enterprise-grade AI-powered Developer Profile Analyzer, Technical Skills Assessment, Developer Comparison, and Candidate-to-Job Matching Platform. Built as a unified full-stack modular monolith using **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

---

## 📸 Visual Showcase & Platform Panels (Dual Light & Dark Mode)

### 1. Hexagonal Honeycomb Grid Hero & Quick-Navigation Anchors
Features the crisp Hexagonal / Honeycomb grid canvas with dual-mode palette adaptation, reactive click shockwave ripples, hardware acceleration, and static visual stability (free of infinite diagonal moving animations):

| Dark Mode ("Mono" Obsidian Palette: `#8A8A99` / `#FFFFFF`) | Light Mode ("Graphite" Palette: `#64748B` / `#0F172A`) |
| :---: | :---: |
| ![Hero Dark Mode](docs/screenshots/landing_hero_dark_mode.png) | ![Hero Light Mode](docs/screenshots/landing_hero_light_mode.png) |

#### Interactive Landing Page Workflows & Provenance Sections
Instant smooth-scrolling navigation jumps directly into the three core evaluation workflows, 5-tier evidence taxonomy, and deterministic scoring models:

| Dark Mode: Landing Workflows & Evidence Trail | Light Mode: Landing Workflows & Evidence Trail |
| :---: | :---: |
| ![Landing Workflows Dark](docs/screenshots/landing_workflows_dark_mode.png) | ![Landing Workflows Light](docs/screenshots/landing_workflows_light_mode.png) |

---

### 2. User Authentication & Registration (Sign Up & Sign In)
Dedicated authentication flows with cryptographic password hashing, session tokens, and instant role provisioning:

| Dark Mode: Sign Up Portal | Light Mode: Sign Up Portal |
| :---: | :---: |
| ![Sign Up Dark](docs/screenshots/signup_dark_mode.png) | ![Sign Up Light](docs/screenshots/signup_light_mode.png) |

| Dark Mode: Sign In Portal | Light Mode: Sign In Portal |
| :---: | :---: |
| ![Sign In Dark](docs/screenshots/signin_dark_mode.png) | ![Sign In Light](docs/screenshots/signin_light_mode.png) |

---

### 3. Executive Dashboard & Technical Evidence Hub
Bento grid overview displaying candidate ingestion counters, verified skills, and recent assessments against a static honeycomb backdrop:

| Dark Mode Dashboard | Light Mode Dashboard |
| :---: | :---: |
| ![Dashboard Dark](docs/screenshots/dashboard_dark_mode.png) | ![Dashboard Light](docs/screenshots/dashboard_light_mode.png) |

---

### 4. Candidate Profiles Directory & Talent Pool
Directory view of ingested candidates with completeness meters, verified technology badges, and audit statuses:

| Dark Mode: Profiles Directory | Light Mode: Profiles Directory |
| :---: | :---: |
| ![Profiles Dark](docs/screenshots/profiles_dark_mode.png) | ![Profiles Light](docs/screenshots/profiles_light_mode.png) |

---

### 5. Candidate Dossier & Ingested Repositories Bento
Comprehensive developer profile with all public repositories ingested, automated test suite indicators, CI/CD status, and architectural complexity scores:

| Dark Mode: Candidate Dossier | Light Mode: Candidate Dossier |
| :---: | :---: |
| ![Candidate Dossier Dark](docs/screenshots/candidate_dossier_dark_mode.png) | ![Candidate Dossier Light](docs/screenshots/candidate_dossier_light_mode.png) |

---

### 6. Developer vs. Developer Comparison Matrix
Side-by-side comparison across technical skills, repository depth, test suite presence, and CI/CD pipelines:

| Dark Mode: Comparison Matrix | Light Mode: Comparison Matrix |
| :---: | :---: |
| ![Compare Dark](docs/screenshots/compare_dark_mode.png) | ![Compare Light](docs/screenshots/compare_light_mode.png) |

---

### 7. Deterministic Candidate-to-Job Matching
100% mathematical scoring with real-time dynamic weight sliders and downloadable CSV audit reports:

| Dark Mode: Job Matching Engine | Light Mode: Job Matching Engine |
| :---: | :---: |
| ![Jobs Matching Dark](docs/screenshots/jobs_matching_dark_mode.png) | ![Jobs Matching Light](docs/screenshots/jobs_matching_light_mode.png) |

---

### 8. Audit Reports & System Compliance
Permanent, auditable comparison reports and candidate rankings with exportable metrics:

| Dark Mode: Audit Reports | Light Mode: Audit Reports |
| :---: | :---: |
| ![Reports Dark](docs/screenshots/reports_dark_mode.png) | ![Reports Light](docs/screenshots/reports_light_mode.png) |

---

### 9. Platform Settings & Workspace Configuration
Configurable evaluation thresholds, scoring weight defaults, and notification parameters:

| Dark Mode: Settings | Light Mode: Settings |
| :---: | :---: |
| ![Settings Dark](docs/screenshots/settings_dark_mode.png) | ![Settings Light](docs/screenshots/settings_light_mode.png) |

---

## 🏛️ System Architecture

![System Architecture Diagram](docs/diagrams/system_architecture.png)

<details>
<summary><b>View Architecture Mermaid Code</b></summary>

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
</details>

---

### Ingestion & Evidence Trail Pipeline

![Ingestion Pipeline Sequence Diagram](docs/diagrams/ingestion_pipeline.png)

<details>
<summary><b>View Sequence Mermaid Code</b></summary>

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
</details>

---

## 🛡️ Role-Based Access Control (RBAC) & System Credentials

DevLens AI enforces strict role-based access control. All dashboard routes require explicit authentication via the sign-in portal (`/sign-in`); unauthenticated attempts to access `/dashboard` or candidate dossiers automatically redirect to the login screen.

### 1. Self-Service Account Creation (Sign Up)
New evaluators and recruiters can create an account directly via `/sign-up` (or `/signup`) with custom credentials and instantaneous role selection (`Recruiter`, `Admin`, or `Viewer`).

### 2. Pre-Configured System Credentials

| Role | Email | Password | Privileges & Administrative Authority |
|---|---|---|---|
| **Administrator** | `admin@devlens.ai` | `Admin@123` | **Full Administrative Authority**: Only Admins can add & delete candidate profiles, create & delete job postings, delete audit reports, and configure system parameters. |
| **Recruiter** | `demo@devlens.ai` | `Demo@123` | **Standard Evaluation**: Ingest candidate profiles (CV/GitHub/Portfolio), run candidate-to-job matching, and generate comparison matrices. Destructive actions are prohibited. |
| **Viewer** | `viewer@devlens.ai` | `Viewer@123` | **Read-Only**: Review candidate dossiers, inspect evidence provenance, and export reports. Forbidden from destructive operations (`403 Forbidden`). |

### 3. Authentication & Access Rules

1. **Explicit Authentication Required**:
   - There is no unauthenticated bypass. Protected routes route through server session validation; unauthenticated visitors are directed to `/sign-in`.
2. **Dedicated Sign-In & Sign-Up**:
   - Register at `http://localhost:3000/sign-up` or sign in at `http://localhost:3000/sign-in`.
3. **Session Management**:
   - Sessions are secured with signed HTTP-only cookies (`devlens_session`) using bcrypt password verification.
   - To switch accounts or sign out, click the **Sign Out** button in the top navigation header.

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

## ⚡ Hexagonal Grid & Modern Bento UI Architecture

The hero landing section and executive dashboard overview incorporate a geometric honeycomb grid architecture engineered for clarity and visual stability:

- **Static Geometric Lattice**: Pre-rendered offscreen canvas generating a clean, crisp honeycomb wireframe across the container background.
- **Distraction-Free Experience**: The infinite diagonal wave propagation (`flow: 0`) and idle shimmer orbits (`autoplay: false`) have been disabled, eliminating visual clutter while preserving the honeycomb grid structure.
- **Interactive Cursor Reaction**: Hover illumination remains active, highlighting individual hexagonal cells under direct pointer interaction.
- **Click-Activated Shockwave Pulses**: Pointer clicks ignite expanding high-velocity concentric shockwave rings (`pulseVelocity: 640 px/s`) across the lattice, dynamically illuminating neighboring cells without disruptive infinite loops.
- **Dual-Mode Palette**:
  - **Dark Mode ("Mono")**: `#8A8A99` wireframe with photon center highlights over deep obsidian backgrounds.
  - **Light Mode ("Graphite")**: `#64748B` wireframe with deep graphite accents over clean slate backgrounds.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15+ (App Router), React 19, TypeScript (Strict Mode) |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Recharts (Radar Visualizer) |
| **Visual Architecture** | Hexagonal Grid Canvas (Static Structure), Dark Bento & Obsidian UI |
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
