import fs from "fs";
import path from "path";
import { prisma } from "../db";

export interface StoredEvidence {
  id: string;
  developerProfileId: string;
  sourceId?: string | null;
  claimType: string;
  claimValue: string;
  sourceExcerpt?: string | null;
  repositoryRef?: string | null;
  confidence: number;
  verificationStatus: "USER_PROVIDED" | "SOURCE_OBSERVED" | "INFERRED" | "USER_CONFIRMED" | "UNABLE_TO_VERIFY";
  observedAt: string;
}

export interface StoredProfileSource {
  id: string;
  developerProfileId: string;
  sourceType: "CV_DOCUMENT" | "GITHUB_PROFILE" | "PORTFOLIO_WEBSITE" | "LINKEDIN_PROFILE" | "MANUAL_ENTRY";
  sourceUrl?: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED" | "REQUIRES_AUTHORIZATION" | "INACCESSIBLE";
  fileName?: string | null;
  fileSize?: number | null;
  rawContent?: string | null;
  errorMetadata?: string | null;
  lastFetchedAt?: string | null;
  createdAt: string;
}

export interface StoredProject {
  id: string;
  developerProfileId: string;
  name: string;
  description?: string | null;
  repositoryUrl?: string | null;
  liveUrl?: string | null;
  technologies: string[];
  complexityScore?: number | null;
  hasTests: boolean;
  hasCI: boolean;
  hasDocs: boolean;
  starsCount?: number;
  primaryLanguage?: string | null;
}

export interface StoredExperience {
  id: string;
  developerProfileId: string;
  employer: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  technologies: string[];
}

export interface StoredDeveloperSkill {
  id: string;
  developerProfileId: string;
  canonicalName: string;
  category: string;
  claimedProficiency?: string | null;
  evidenceStatus: "UNVERIFIED" | "CLAIMED" | "VERIFIED" | "INFERRED";
}

export interface StoredDeveloperProfile {
  id: string;
  ownerId: string;
  name: string;
  headline?: string | null;
  summary?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  githubUsername?: string | null;
  linkedinUrl?: string | null;
  completeness: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  sources: StoredProfileSource[];
  skills: StoredDeveloperSkill[];
  experiences: StoredExperience[];
  projects: StoredProject[];
  evidences: StoredEvidence[];
}

export interface StoredJob {
  id: string;
  ownerId: string;
  title: string;
  company?: string | null;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: number;
  domainRequirements: string[];
  scoringWeights?: {
    techSkills: number;
    projectRelevance: number;
    experienceAlignment: number;
    engineeringPractices: number;
    otherRequirements: number;
  };
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoredComparisonResult {
  id: string;
  developerProfileId: string;
  developerName: string;
  totalScore: number;
  categoryScores: any;
  evidenceCoverage: number;
  strengths: string[];
  gaps: string[];
  explanation: string;
  ranking: number;
}

export interface StoredComparison {
  id: string;
  ownerId: string;
  jobId?: string | null;
  title: string;
  comparisonType: "DEVELOPER_VS_DEVELOPER" | "DEVELOPERS_VS_JOB" | "DEVELOPER_VS_JOB";
  configuration?: any;
  createdAt: string;
  results: StoredComparisonResult[];
}

export interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
  role: "ADMIN" | "RECRUITER" | "VIEWER";
  createdAt: string;
}

interface DevLensDatabaseState {
  users: StoredUser[];
  profiles: StoredDeveloperProfile[];
  jobs: StoredJob[];
  comparisons: StoredComparison[];
}

const DATA_FILE_PATH = path.join(process.cwd(), ".devlens_data.json");

// Pre-seeded initial data demonstrating full evidence tracking and developer profiles
const INITIAL_DEMO_DATA: DevLensDatabaseState = {
  users: [
    {
      id: "admin-user-1",
      email: "admin@devlens.ai",
      name: "Lead System Administrator",
      passwordHash: "$2b$10$wKz0bBvXh1LqvI6vOiq9sONJ3gR/P4G.YQk0fF9aJ7p2d9G9h1r5a", // Admin@123 / Demo@123
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-user-1",
      email: "demo@devlens.ai",
      name: "Engineering Hiring Team",
      passwordHash: "$2b$10$wKz0bBvXh1LqvI6vOiq9sONJ3gR/P4G.YQk0fF9aJ7p2d9G9h1r5a", // Demo@123
      role: "RECRUITER",
      createdAt: new Date().toISOString(),
    },
  ],
  profiles: [
    {
      id: "prof-1",
      ownerId: "demo-user-1",
      name: "Sarah Chen",
      headline: "Senior Full-Stack & Distributed Systems Engineer",
      summary: "8+ years building high-concurrency cloud native architectures, real-time analytics, and TypeScript/Node.js/Go platforms with rigorous testing and automated CI.",
      email: "sarah.chen@example.dev",
      location: "San Francisco, CA (Remote)",
      websiteUrl: "https://sarahchen.dev",
      githubUsername: "sarahchen-dev",
      linkedinUrl: "https://linkedin.com/in/sarahchen-lead",
      completeness: 92,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      sources: [
        {
          id: "src-1",
          developerProfileId: "prof-1",
          sourceType: "CV_DOCUMENT",
          status: "COMPLETED",
          fileName: "Sarah_Chen_Principal_CV.pdf",
          fileSize: 182400,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: "src-2",
          developerProfileId: "prof-1",
          sourceType: "GITHUB_PROFILE",
          sourceUrl: "https://github.com/sarahchen-dev",
          status: "COMPLETED",
          lastFetchedAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        },
      ],
      skills: [
        { id: "sk-1", developerProfileId: "prof-1", canonicalName: "TypeScript", category: "Languages", claimedProficiency: "Expert", evidenceStatus: "VERIFIED" },
        { id: "sk-2", developerProfileId: "prof-1", canonicalName: "React", category: "Frontend", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-3", developerProfileId: "prof-1", canonicalName: "Node.js", category: "Backend", claimedProficiency: "Expert", evidenceStatus: "VERIFIED" },
        { id: "sk-4", developerProfileId: "prof-1", canonicalName: "PostgreSQL", category: "Databases", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-5", developerProfileId: "prof-1", canonicalName: "Go", category: "Languages", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-6", developerProfileId: "prof-1", canonicalName: "Docker", category: "Cloud & DevOps", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-7", developerProfileId: "prof-1", canonicalName: "Kubernetes", category: "Cloud & DevOps", claimedProficiency: "Mid", evidenceStatus: "CLAIMED" },
        { id: "sk-8", developerProfileId: "prof-1", canonicalName: "CI/CD", category: "Cloud & DevOps", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
      ],
      experiences: [
        {
          id: "exp-1",
          developerProfileId: "prof-1",
          employer: "ScaleStream Data",
          title: "Staff Software Engineer",
          description: "Led core ingestion infrastructure handling 2.4B events/day using Go and Node.js microservices. Implemented end-to-end automated testing pipelines reducing deployment incidents by 44%.",
          location: "San Francisco, CA",
          startDate: "2021-03-01",
          isCurrent: true,
          technologies: ["Go", "TypeScript", "PostgreSQL", "Docker", "Kafka"],
        },
        {
          id: "exp-2",
          developerProfileId: "prof-1",
          employer: "Nexus Cloud Systems",
          title: "Senior Backend Developer",
          description: "Designed resilient GraphQL and REST APIs in Node.js backed by PostgreSQL and Redis. Spearheaded unit and contract testing with Jest and Supertest.",
          location: "Remote",
          startDate: "2018-06-01",
          endDate: "2021-02-01",
          isCurrent: false,
          technologies: ["Node.js", "TypeScript", "React", "PostgreSQL", "Redis"],
        },
      ],
      projects: [
        {
          id: "proj-1",
          developerProfileId: "prof-1",
          name: "streamline-db-cdc",
          description: "High-performance Change Data Capture connector for PostgreSQL with real-time replication.",
          repositoryUrl: "https://github.com/sarahchen-dev/streamline-db-cdc",
          technologies: ["Go", "PostgreSQL", "Docker"],
          complexityScore: 88,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 142,
          primaryLanguage: "Go",
        },
        {
          id: "proj-2",
          developerProfileId: "prof-1",
          name: "react-flow-analytics",
          description: "Interactive real-time analytics dashboard with React 19, TypeScript, and Tailwind CSS.",
          repositoryUrl: "https://github.com/sarahchen-dev/react-flow-analytics",
          technologies: ["React", "TypeScript", "Tailwind CSS"],
          complexityScore: 78,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 89,
          primaryLanguage: "TypeScript",
        },
        {
          id: "proj-1b",
          developerProfileId: "prof-1",
          name: "raft-consensus-kv",
          description: "Distributed Raft key-value storage engine implemented in Go with automated cluster failure testing.",
          repositoryUrl: "https://github.com/sarahchen-dev/raft-consensus-kv",
          technologies: ["Go", "Distributed Systems", "Docker"],
          complexityScore: 92,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 215,
          primaryLanguage: "Go",
        },
        {
          id: "proj-1c",
          developerProfileId: "prof-1",
          name: "gateway-reverse-proxy",
          description: "Zero-allocation HTTP/2 & gRPC edge proxy with JWT validation and rate limiting.",
          repositoryUrl: "https://github.com/sarahchen-dev/gateway-reverse-proxy",
          technologies: ["TypeScript", "Node.js", "Redis"],
          complexityScore: 84,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 67,
          primaryLanguage: "TypeScript",
        },
        {
          id: "proj-1d",
          developerProfileId: "prof-1",
          name: "k8s-pod-autoscaler",
          description: "Custom Kubernetes operator for event-driven autoscaling based on Kafka consumer lag.",
          repositoryUrl: "https://github.com/sarahchen-dev/k8s-pod-autoscaler",
          technologies: ["Go", "Kubernetes", "Kafka"],
          complexityScore: 89,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 110,
          primaryLanguage: "Go",
        },
      ],
      evidences: [
        {
          id: "ev-1",
          developerProfileId: "prof-1",
          claimType: "SKILL",
          claimValue: "Demonstrated production PostgreSQL database design and CDC streaming",
          sourceExcerpt: "streamline-db-cdc: High-performance Change Data Capture connector for PostgreSQL",
          repositoryRef: "github.com/sarahchen-dev/streamline-db-cdc",
          confidence: 0.95,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        },
        {
          id: "ev-2",
          developerProfileId: "prof-1",
          claimType: "ENGINEERING_PRACTICE",
          claimValue: "Automated CI/CD test workflow verified via GitHub Actions (.github/workflows/ci.yml)",
          sourceExcerpt: "GitHub Actions workflow executed 48 test suites on push",
          repositoryRef: "github.com/sarahchen-dev/streamline-db-cdc",
          confidence: 1.0,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "prof-2",
      ownerId: "demo-user-1",
      name: "Marcus Vance",
      headline: "Frontend Architect & Full-Stack TypeScript Specialist",
      summary: "6+ years crafting enterprise React/Next.js web applications, design systems, and frontend performance optimizations.",
      email: "marcus.vance@example.dev",
      location: "Austin, TX",
      websiteUrl: "https://marcusvance.io",
      githubUsername: "marcusvance",
      linkedinUrl: "https://linkedin.com/in/marcusvance",
      completeness: 85,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      sources: [
        {
          id: "src-3",
          developerProfileId: "prof-2",
          sourceType: "GITHUB_PROFILE",
          sourceUrl: "https://github.com/marcusvance",
          status: "COMPLETED",
          lastFetchedAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ],
      skills: [
        { id: "sk-9", developerProfileId: "prof-2", canonicalName: "TypeScript", category: "Languages", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-10", developerProfileId: "prof-2", canonicalName: "React", category: "Frontend", claimedProficiency: "Expert", evidenceStatus: "VERIFIED" },
        { id: "sk-11", developerProfileId: "prof-2", canonicalName: "Next.js", category: "Frontend", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-12", developerProfileId: "prof-2", canonicalName: "Tailwind CSS", category: "Frontend", claimedProficiency: "Expert", evidenceStatus: "VERIFIED" },
        { id: "sk-13", developerProfileId: "prof-2", canonicalName: "Node.js", category: "Backend", claimedProficiency: "Mid", evidenceStatus: "CLAIMED" },
        { id: "sk-14", developerProfileId: "prof-2", canonicalName: "PostgreSQL", category: "Databases", claimedProficiency: "Mid", evidenceStatus: "CLAIMED" },
      ],
      experiences: [
        {
          id: "exp-3",
          developerProfileId: "prof-2",
          employer: "DesignOps Systems",
          title: "Lead Frontend Engineer",
          description: "Architected component library utilized across 12 SaaS products. Reduced bundle size by 38% and improved Core Web Vitals to 98/100.",
          location: "Austin, TX",
          startDate: "2020-01-01",
          isCurrent: true,
          technologies: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        },
      ],
      projects: [
        {
          id: "proj-3",
          developerProfileId: "prof-2",
          name: "lumina-ui-components",
          description: "Accessible, high-performance headless component system built with Radix and Tailwind CSS.",
          repositoryUrl: "https://github.com/marcusvance/lumina-ui-components",
          technologies: ["React", "TypeScript", "Tailwind CSS"],
          complexityScore: 82,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 310,
          primaryLanguage: "TypeScript",
        },
        {
          id: "proj-3b",
          developerProfileId: "prof-2",
          name: "next-commerce-platform",
          description: "Production Next.js 15 e-commerce store with server actions, optimistic UI, and Stripe integration.",
          repositoryUrl: "https://github.com/marcusvance/next-commerce-platform",
          technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
          complexityScore: 80,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 178,
          primaryLanguage: "TypeScript",
        },
        {
          id: "proj-3c",
          developerProfileId: "prof-2",
          name: "design-tokens-compiler",
          description: "CLI tool converting Figma design tokens into type-safe CSS and Tailwind theme configurations.",
          repositoryUrl: "https://github.com/marcusvance/design-tokens-compiler",
          technologies: ["TypeScript", "Node.js"],
          complexityScore: 76,
          hasTests: true,
          hasCI: false,
          hasDocs: true,
          starsCount: 94,
          primaryLanguage: "TypeScript",
        },
        {
          id: "proj-3d",
          developerProfileId: "prof-2",
          name: "react-perf-profiler",
          description: "Lightweight devtools extension for identifying unneeded React re-renders and memory leaks.",
          repositoryUrl: "https://github.com/marcusvance/react-perf-profiler",
          technologies: ["React", "TypeScript", "Chrome Extensions"],
          complexityScore: 86,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 420,
          primaryLanguage: "TypeScript",
        },
      ],
      evidences: [
        {
          id: "ev-3",
          developerProfileId: "prof-2",
          claimType: "SKILL",
          claimValue: "Demonstrated advanced React and design system expertise in production library",
          sourceExcerpt: "lumina-ui-components: 300+ stars, 100% test pass rate in CI",
          repositoryRef: "github.com/marcusvance/lumina-ui-components",
          confidence: 0.95,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: "prof-3",
      ownerId: "demo-user-1",
      name: "Elena Rostova",
      headline: "Backend & Systems Engineer (Python / FastAPI / PostgreSQL)",
      summary: "5+ years backend engineering focused on data-intensive services, async Python, API reliability, and Dockerized deployments.",
      email: "elena.rostova@example.dev",
      location: "Seattle, WA",
      websiteUrl: "https://elenarostova.dev",
      githubUsername: "erostova",
      completeness: 80,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      sources: [
        {
          id: "src-4",
          developerProfileId: "prof-3",
          sourceType: "CV_DOCUMENT",
          status: "COMPLETED",
          fileName: "Elena_Rostova_Resume.pdf",
          fileSize: 145000,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
      skills: [
        { id: "sk-15", developerProfileId: "prof-3", canonicalName: "Python", category: "Languages", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-16", developerProfileId: "prof-3", canonicalName: "FastAPI", category: "Backend", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-17", developerProfileId: "prof-3", canonicalName: "PostgreSQL", category: "Databases", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-18", developerProfileId: "prof-3", canonicalName: "Docker", category: "Cloud & DevOps", claimedProficiency: "Senior", evidenceStatus: "VERIFIED" },
        { id: "sk-19", developerProfileId: "prof-3", canonicalName: "Redis", category: "Databases", claimedProficiency: "Mid", evidenceStatus: "CLAIMED" },
      ],
      experiences: [
        {
          id: "exp-4",
          developerProfileId: "prof-3",
          employer: "DataForge Technologies",
          title: "Senior Backend Developer",
          description: "Engineered scalable data ingestion workers in Python and FastAPI. Optimized complex PostgreSQL queries and indexing, cutting P95 response times by 62%.",
          location: "Seattle, WA",
          startDate: "2021-04-01",
          isCurrent: true,
          technologies: ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        },
      ],
      projects: [
        {
          id: "proj-4",
          developerProfileId: "prof-3",
          name: "async-task-router",
          description: "Resilient async queue dispatcher with backpressure support and PostgreSQL audit logs.",
          repositoryUrl: "https://github.com/erostova/async-task-router",
          technologies: ["Python", "FastAPI", "PostgreSQL"],
          complexityScore: 84,
          hasTests: true,
          hasCI: true,
          hasDocs: true,
          starsCount: 95,
          primaryLanguage: "Python",
        },
      ],
      evidences: [
        {
          id: "ev-4",
          developerProfileId: "prof-3",
          claimType: "SKILL",
          claimValue: "Demonstrated asynchronous Python & FastAPI architecture with PostgreSQL",
          sourceExcerpt: "async-task-router repository with PyTest unit tests and GitHub Actions CI",
          repositoryRef: "github.com/erostova/async-task-router",
          confidence: 0.95,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        },
      ],
    },
  ],
  jobs: [
    {
      id: "job-1",
      ownerId: "demo-user-1",
      title: "Senior Full-Stack Engineer (TypeScript & PostgreSQL)",
      company: "DevLens Platform Engineering",
      description: "We are seeking a seasoned Senior Full-Stack Engineer to architect, build, and scale our core evidence-based matching engine. You will work extensively across modern React frontends, TypeScript backend services, and robust PostgreSQL databases with strict automated testing practices.",
      requiredSkills: ["TypeScript", "React", "PostgreSQL", "Node.js"],
      preferredSkills: ["Docker", "Go", "CI/CD"],
      requiredExperience: 4,
      domainRequirements: ["SaaS Architecture", "High Concurrency"],
      scoringWeights: {
        techSkills: 35,
        projectRelevance: 25,
        experienceAlignment: 20,
        engineeringPractices: 10,
        otherRequirements: 10,
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: "job-2",
      ownerId: "demo-user-1",
      title: "Backend Cloud Systems Engineer (Python / API)",
      company: "CloudCore Infrastructure",
      description: "Seeking a backend engineer specializing in Python, FastAPI, and PostgreSQL to design high-throughput distributed ingestion pipelines. Must have strong evidence of automated unit testing and containerization.",
      requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
      preferredSkills: ["Redis", "Kubernetes"],
      requiredExperience: 3,
      domainRequirements: ["Data Pipelines"],
      scoringWeights: {
        techSkills: 40,
        projectRelevance: 20,
        experienceAlignment: 20,
        engineeringPractices: 15,
        otherRequirements: 5,
      },
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  comparisons: [],
};

class DevLensStore {
  private state: DevLensDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DevLensDatabaseState {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        // Ensure admin user exists in state
        if (!parsed.users || !parsed.users.some((u: any) => u.email === "admin@devlens.ai")) {
          parsed.users = [...INITIAL_DEMO_DATA.users, ...(parsed.users || [])];
        }
        // Ensure roles are assigned
        parsed.users.forEach((u: any) => {
          if (!u.role) {
            u.role = u.email === "admin@devlens.ai" ? "ADMIN" : "RECRUITER";
          }
        });
        return parsed;
      }
    } catch {
      // Fall back to clean initial demo data
    }
    this.persist(INITIAL_DEMO_DATA);
    return INITIAL_DEMO_DATA;
  }

  private persist(data: DevLensDatabaseState) {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist data store:", err);
    }
  }

  // --- Users ---
  public findUserByEmail(email: string): StoredUser | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public createUser(user: StoredUser): StoredUser {
    this.state.users.push(user);
    this.persist(this.state);
    return user;
  }

  // --- Profiles ---
  public getProfiles(ownerId: string): StoredDeveloperProfile[] {
    return this.state.profiles.filter((p) => p.ownerId === ownerId || p.ownerId === "demo-user-1");
  }

  public getProfileById(id: string, ownerId?: string): StoredDeveloperProfile | undefined {
    return this.state.profiles.find((p) => p.id === id);
  }

  public saveProfile(profile: StoredDeveloperProfile): StoredDeveloperProfile {
    const idx = this.state.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      this.state.profiles[idx] = profile;
    } else {
      this.state.profiles.unshift(profile);
    }
    this.persist(this.state);
    return profile;
  }

  public deleteProfile(id: string, ownerId?: string): boolean {
    const initLen = this.state.profiles.length;
    this.state.profiles = this.state.profiles.filter((p) => p.id !== id);
    if (this.state.profiles.length !== initLen) {
      // Also clean up comparisons referencing this candidate profile
      this.state.comparisons = this.state.comparisons.map((c) => ({
        ...c,
        results: c.results.filter((r) => r.developerProfileId !== id),
      }));
      this.persist(this.state);
      return true;
    }
    return false;
  }

  // --- Jobs ---
  public getJobs(ownerId: string): StoredJob[] {
    return this.state.jobs.filter((j) => (j.ownerId === ownerId || j.ownerId === "demo-user-1") && !j.isArchived);
  }

  public getJobById(id: string): StoredJob | undefined {
    return this.state.jobs.find((j) => j.id === id);
  }

  public saveJob(job: StoredJob): StoredJob {
    const idx = this.state.jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      this.state.jobs[idx] = job;
    } else {
      this.state.jobs.unshift(job);
    }
    this.persist(this.state);
    return job;
  }

  public deleteJob(id: string, ownerId?: string): boolean {
    const idx = this.state.jobs.findIndex((j) => j.id === id);
    if (idx >= 0) {
      this.state.jobs.splice(idx, 1);
      // Clean up comparisons tied specifically to this job
      this.state.comparisons = this.state.comparisons.filter((c) => c.jobId !== id);
      this.persist(this.state);
      return true;
    }
    return false;
  }

  // --- Comparisons ---
  public getComparisons(ownerId: string): StoredComparison[] {
    return this.state.comparisons.filter((c) => c.ownerId === ownerId || c.ownerId === "demo-user-1");
  }

  public getComparisonById(id: string): StoredComparison | undefined {
    return this.state.comparisons.find((c) => c.id === id);
  }

  public saveComparison(comparison: StoredComparison): StoredComparison {
    const idx = this.state.comparisons.findIndex((c) => c.id === comparison.id);
    if (idx >= 0) {
      this.state.comparisons[idx] = comparison;
    } else {
      this.state.comparisons.unshift(comparison);
    }
    this.persist(this.state);
    return comparison;
  }

  public deleteComparison(id: string): boolean {
    const idx = this.state.comparisons.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.state.comparisons.splice(idx, 1);
      this.persist(this.state);
      return true;
    }
    return false;
  }

  // --- Dashboard Metrics ---
  public getMetrics(ownerId: string) {
    const profiles = this.getProfiles(ownerId);
    const jobs = this.getJobs(ownerId);
    const comparisons = this.getComparisons(ownerId);

    const pendingImports = profiles.reduce(
      (acc, p) => acc + p.sources.filter((s) => s.status === "PENDING" || s.status === "PROCESSING").length,
      0
    );

    const failedImports = profiles.reduce(
      (acc, p) => acc + p.sources.filter((s) => s.status === "FAILED").length,
      0
    );

    return {
      totalProfiles: profiles.length,
      totalJobs: jobs.length,
      totalComparisons: comparisons.length,
      pendingImports,
      failedImports,
      recentProfiles: profiles.slice(0, 5),
      recentJobs: jobs.slice(0, 5),
      recentComparisons: comparisons.slice(0, 5),
    };
  }
}

export const dbStore = new DevLensStore();
