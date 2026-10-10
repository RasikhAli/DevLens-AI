export interface ScoringWeights {
  techSkills: number; // default: 35
  projectRelevance: number; // default: 25
  experienceAlignment: number; // default: 20
  engineeringPractices: number; // default: 10
  otherRequirements: number; // default: 10
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  techSkills: 35,
  projectRelevance: 25,
  experienceAlignment: 20,
  engineeringPractices: 10,
  otherRequirements: 10,
};

export interface ScoredCategoryBreakdown {
  score: number; // 0 to 100
  weight: number; // percentage (normalized)
  weightedScore: number; // (score * weight) / 100
  evidenceFound: string[];
  missingEvidence: string[];
  notes: string;
}

export interface CandidateEvaluationResult {
  developerProfileId: string;
  developerName: string;
  totalScore: number; // 0 to 100
  evidenceCoverage: number; // 0 to 100 percentage
  categories: {
    techSkills: ScoredCategoryBreakdown;
    projectRelevance: ScoredCategoryBreakdown;
    experienceAlignment: ScoredCategoryBreakdown;
    engineeringPractices: ScoredCategoryBreakdown;
    otherRequirements: ScoredCategoryBreakdown;
  };
  strengths: string[];
  gaps: string[];
  limitations: string[];
  explanation: string;
  ranking?: number;
}

export interface JobEvaluationCriteria {
  id: string;
  title: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  requiredExperienceYears?: number;
  domainRequirements?: string[];
  weights?: Partial<ScoringWeights>;
}

export interface DeveloperEvaluationInput {
  id: string;
  name: string;
  skills: Array<{
    name: string;
    evidenceStatus?: "UNVERIFIED" | "CLAIMED" | "VERIFIED" | "INFERRED";
    yearsExperience?: number;
  }>;
  projects: Array<{
    name: string;
    description?: string | null;
    technologies: string[];
    hasTests?: boolean;
    hasCI?: boolean;
    hasDocs?: boolean;
    complexityScore?: number | null;
    starsCount?: number | null;
  }>;
  experiences: Array<{
    employer: string;
    title: string;
    description?: string | null;
    technologies: string[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    isCurrent?: boolean;
  }>;
  evidences: Array<{
    claimType: string;
    claimValue: string;
    sourceExcerpt?: string | null;
    verificationStatus: string;
    confidence: number;
  }>;
}
