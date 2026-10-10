import {
  type ScoringWeights,
  type ScoredCategoryBreakdown,
  type CandidateEvaluationResult,
  type JobEvaluationCriteria,
  type DeveloperEvaluationInput,
  DEFAULT_SCORING_WEIGHTS,
} from "./types";
import { normalizeSkill, areSkillsRelated } from "../skills/normalizer";

/**
 * Normalizes user or job weights to ensure they sum to exactly 100%
 */
export function normalizeWeights(weights?: Partial<ScoringWeights>): ScoringWeights {
  const merged: ScoringWeights = {
    techSkills: weights?.techSkills ?? DEFAULT_SCORING_WEIGHTS.techSkills,
    projectRelevance: weights?.projectRelevance ?? DEFAULT_SCORING_WEIGHTS.projectRelevance,
    experienceAlignment: weights?.experienceAlignment ?? DEFAULT_SCORING_WEIGHTS.experienceAlignment,
    engineeringPractices: weights?.engineeringPractices ?? DEFAULT_SCORING_WEIGHTS.engineeringPractices,
    otherRequirements: weights?.otherRequirements ?? DEFAULT_SCORING_WEIGHTS.otherRequirements,
  };

  const total =
    merged.techSkills +
    merged.projectRelevance +
    merged.experienceAlignment +
    merged.engineeringPractices +
    merged.otherRequirements;

  if (total <= 0) return DEFAULT_SCORING_WEIGHTS;

  return {
    techSkills: Math.round((merged.techSkills / total) * 1000) / 10,
    projectRelevance: Math.round((merged.projectRelevance / total) * 1000) / 10,
    experienceAlignment: Math.round((merged.experienceAlignment / total) * 1000) / 10,
    engineeringPractices: Math.round((merged.engineeringPractices / total) * 1000) / 10,
    otherRequirements: Math.round((merged.otherRequirements / total) * 1000) / 10,
  };
}

/**
 * Deterministic scoring engine for DevLens AI
 */
export function evaluateCandidateAgainstJob(
  candidate: DeveloperEvaluationInput,
  job: JobEvaluationCriteria
): CandidateEvaluationResult {
  const weights = normalizeWeights(job.weights);
  const strengths: string[] = [];
  const gaps: string[] = [];
  const limitations: string[] = [];

  // Normalize all candidate skills
  const candidateSkills = candidate.skills.map((s) => ({
    raw: s.name,
    normalized: normalizeSkill(s.name).canonicalName,
    evidenceStatus: s.evidenceStatus || "UNVERIFIED",
  }));

  // --- 1. TECHNICAL SKILL ALIGNMENT ---
  const requiredSkills = (job.requiredSkills || []).map((s) => normalizeSkill(s).canonicalName);
  const preferredSkills = (job.preferredSkills || []).map((s) => normalizeSkill(s).canonicalName);

  let matchedRequiredCount = 0;
  let partialRequiredCount = 0;
  const techEvidenceFound: string[] = [];
  const techMissingEvidence: string[] = [];

  for (const req of requiredSkills) {
    const direct = candidateSkills.find(
      (cs) => cs.normalized.toLowerCase() === req.toLowerCase()
    );
    if (direct) {
      matchedRequiredCount += 1;
      techEvidenceFound.push(`${req} (Direct match${direct.evidenceStatus === "VERIFIED" ? " - Verified" : ""})`);
    } else {
      // Check related transferable skill
      const related = candidateSkills.find((cs) => areSkillsRelated(cs.normalized, req));
      if (related) {
        partialRequiredCount += 0.55;
        techEvidenceFound.push(`${req} (Related transferable: ${related.normalized})`);
      } else {
        techMissingEvidence.push(req);
      }
    }
  }

  // Bonus for preferred skills
  let preferredMatchedCount = 0;
  for (const pref of preferredSkills) {
    const direct = candidateSkills.find(
      (cs) => cs.normalized.toLowerCase() === pref.toLowerCase()
    );
    if (direct) {
      preferredMatchedCount += 1;
      techEvidenceFound.push(`Preferred: ${pref}`);
    }
  }

  const baseReqScore =
    requiredSkills.length > 0
      ? ((matchedRequiredCount + partialRequiredCount) / requiredSkills.length) * 100
      : 80; // If no required skills specified
  const prefBonus = preferredSkills.length > 0 ? (preferredMatchedCount / preferredSkills.length) * 15 : 0;
  const techScore = Math.min(100, Math.round(baseReqScore + prefBonus));

  const techBreakdown: ScoredCategoryBreakdown = {
    score: techScore,
    weight: weights.techSkills,
    weightedScore: Math.round((techScore * weights.techSkills) / 100 * 10) / 10,
    evidenceFound: techEvidenceFound,
    missingEvidence: techMissingEvidence,
    notes: `${matchedRequiredCount} of ${requiredSkills.length} required skills matched directly; ${techMissingEvidence.length} missing.`,
  };

  if (techScore >= 80) {
    strengths.push(`Strong technical skill alignment (${techScore}/100) with key required technologies.`);
  } else if (techMissingEvidence.length > 0) {
    gaps.push(`Missing demonstrated skills for: ${techMissingEvidence.slice(0, 3).join(", ")}.`);
  }

  // --- 2. PROJECT RELEVANCE ---
  const projectEvidence: string[] = [];
  const projectMissing: string[] = [];
  let projectPoints = 0;
  const targetReqSet = new Set(requiredSkills.map((s) => s.toLowerCase()));

  if (candidate.projects.length === 0) {
    projectMissing.push("No public or portfolio projects imported.");
    projectPoints = 35; // Missing data policy: baseline neutrality instead of zero
    limitations.push("Project analysis limited by lack of imported repositories or portfolio projects.");
  } else {
    for (const proj of candidate.projects) {
      const projTechs = proj.technologies.map((t) => normalizeSkill(t).canonicalName.toLowerCase());
      const hasJobTech = projTechs.some((t) => targetReqSet.has(t));
      if (hasJobTech) {
        projectPoints += 25;
        projectEvidence.push(`Project "${proj.name}" utilizes relevant stack: ${proj.technologies.slice(0, 4).join(", ")}`);
      } else {
        projectPoints += 15;
      }
    }
    projectPoints = Math.min(100, Math.max(40, projectPoints));
  }

  const projectBreakdown: ScoredCategoryBreakdown = {
    score: projectPoints,
    weight: weights.projectRelevance,
    weightedScore: Math.round((projectPoints * weights.projectRelevance) / 100 * 10) / 10,
    evidenceFound: projectEvidence,
    missingEvidence: projectMissing,
    notes: candidate.projects.length > 0
      ? `${candidate.projects.length} projects analyzed with relevant technology stacks.`
      : "No projects available for inspection.",
  };

  if (projectPoints >= 75) {
    strengths.push(`Relevant project history showcasing practical application of target technologies.`);
  }

  // --- 3. EXPERIENCE ALIGNMENT ---
  const expEvidence: string[] = [];
  const expMissing: string[] = [];
  let expScore = 50;

  if (candidate.experiences.length === 0) {
    expMissing.push("No work experience records documented.");
    expScore = 40;
    limitations.push("Work experience dimension based solely on self-reported summary or is omitted.");
  } else {
    let relevantExpCount = 0;
    for (const exp of candidate.experiences) {
      const expTechs = exp.technologies.map((t) => normalizeSkill(t).canonicalName.toLowerCase());
      const hasJobTech = expTechs.some((t) => targetReqSet.has(t));
      if (hasJobTech || (exp.title && /engineer|developer|architect|lead/i.test(exp.title))) {
        relevantExpCount += 1;
        expEvidence.push(`${exp.title} at ${exp.employer} (${exp.technologies.slice(0, 3).join(", ")})`);
      }
    }
    expScore = Math.min(100, Math.round(50 + (relevantExpCount * 20)));
  }

  const expBreakdown: ScoredCategoryBreakdown = {
    score: expScore,
    weight: weights.experienceAlignment,
    weightedScore: Math.round((expScore * weights.experienceAlignment) / 100 * 10) / 10,
    evidenceFound: expEvidence,
    missingEvidence: expMissing,
    notes: `${candidate.experiences.length} positions documented; ${expEvidence.length} relevant to engineering domain.`,
  };

  // --- 4. ENGINEERING PRACTICES EVIDENCE ---
  const engEvidence: string[] = [];
  const engMissing: string[] = [];
  let engScore = 40; // baseline

  const testProjects = candidate.projects.filter((p) => p.hasTests);
  const ciProjects = candidate.projects.filter((p) => p.hasCI);
  const docsProjects = candidate.projects.filter((p) => p.hasDocs);

  if (testProjects.length > 0) {
    engScore += 25;
    engEvidence.push(`Automated test suites detected in ${testProjects.length} project(s) (${testProjects.map((p) => p.name).join(", ")})`);
  } else {
    engMissing.push("No automated tests detected in inspectable repositories.");
  }

  if (ciProjects.length > 0) {
    engScore += 20;
    engEvidence.push(`CI/CD pipeline workflows detected in ${ciProjects.length} project(s)`);
  } else {
    engMissing.push("No CI/CD pipeline workflows observed in project repositories.");
  }

  if (docsProjects.length > 0) {
    engScore += 15;
    engEvidence.push(`Structured documentation and READMEs present in ${docsProjects.length} project(s)`);
  }

  engScore = Math.min(100, engScore);

  const engBreakdown: ScoredCategoryBreakdown = {
    score: engScore,
    weight: weights.engineeringPractices,
    weightedScore: Math.round((engScore * weights.engineeringPractices) / 100 * 10) / 10,
    evidenceFound: engEvidence,
    missingEvidence: engMissing,
    notes: testProjects.length > 0 || ciProjects.length > 0
      ? "Observational evidence of testing and continuous integration detected."
      : "Limited public evidence of automated testing and CI/CD pipelines.",
  };

  if (engScore >= 75) {
    strengths.push("Demonstrated engineering discipline with automated testing and CI workflows.");
  } else {
    gaps.push("Limited demonstrable evidence of automated testing or CI/CD pipelines.");
  }

  // --- 5. OTHER JOB REQUIREMENTS / DOMAIN ALIGNMENT ---
  const otherEvidence: string[] = [];
  const otherMissing: string[] = [];
  let otherScore = 60; // neutral default

  if (job.domainRequirements && job.domainRequirements.length > 0) {
    let domainMatched = 0;
    for (const domain of job.domainRequirements) {
      const matchInExp = candidate.experiences.some(
        (e) => (e.description && e.description.toLowerCase().includes(domain.toLowerCase())) ||
               (e.employer && e.employer.toLowerCase().includes(domain.toLowerCase()))
      );
      if (matchInExp) {
        domainMatched += 1;
        otherEvidence.push(`Demonstrated domain experience in ${domain}`);
      } else {
        otherMissing.push(`Domain familiarity in ${domain}`);
      }
    }
    otherScore = Math.round((domainMatched / job.domainRequirements.length) * 100);
  } else {
    otherEvidence.push("Standard engineering requirements satisfied.");
  }

  const otherBreakdown: ScoredCategoryBreakdown = {
    score: otherScore,
    weight: weights.otherRequirements,
    weightedScore: Math.round((otherScore * weights.otherRequirements) / 100 * 10) / 10,
    evidenceFound: otherEvidence,
    missingEvidence: otherMissing,
    notes: job.domainRequirements?.length
      ? `${otherEvidence.length} of ${job.domainRequirements.length} domain requirements verified.`
      : "General software engineering qualifications evaluated.",
  };

  // --- EVIDENCE COVERAGE (0-100%) ---
  // Evaluates how many verifiable claims were backed by actual sources
  const totalClaims = requiredSkills.length + (candidate.projects.length ? 2 : 0) + (candidate.experiences.length ? 1 : 0);
  const backedClaims = techEvidenceFound.length + (testProjects.length ? 1 : 0) + (ciProjects.length ? 1 : 0);
  const evidenceCoverage = Math.min(100, Math.max(20, Math.round((backedClaims / Math.max(1, totalClaims)) * 100)));

  // Calculate final deterministic total score
  const totalScore = Math.round(
    techBreakdown.weightedScore +
    projectBreakdown.weightedScore +
    expBreakdown.weightedScore +
    engBreakdown.weightedScore +
    otherBreakdown.weightedScore
  );

  const explanation =
    `Overall match score of ${totalScore}/100 is computed deterministically across 5 dimensions: ` +
    `Technical Skills (${techScore}/100 at ${weights.techSkills}%), ` +
    `Project Relevance (${projectPoints}/100 at ${weights.projectRelevance}%), ` +
    `Experience (${expScore}/100 at ${weights.experienceAlignment}%), ` +
    `Engineering Practices (${engScore}/100 at ${weights.engineeringPractices}%), and ` +
    `Other Requirements (${otherScore}/100 at ${weights.otherRequirements}%). ` +
    `Evidence coverage is estimated at ${evidenceCoverage}%.`;

  return {
    developerProfileId: candidate.id,
    developerName: candidate.name,
    totalScore,
    evidenceCoverage,
    categories: {
      techSkills: techBreakdown,
      projectRelevance: projectBreakdown,
      experienceAlignment: expBreakdown,
      engineeringPractices: engBreakdown,
      otherRequirements: otherBreakdown,
    },
    strengths,
    gaps,
    limitations,
    explanation,
  };
}

/**
 * Rank multiple candidates deterministically against a single job
 */
export function rankCandidatesAgainstJob(
  candidates: DeveloperEvaluationInput[],
  job: JobEvaluationCriteria
): CandidateEvaluationResult[] {
  const evaluations = candidates.map((c) => evaluateCandidateAgainstJob(c, job));

  // Sort descending by totalScore, then evidenceCoverage as tiebreaker
  evaluations.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.evidenceCoverage - a.evidenceCoverage;
  });

  return evaluations.map((res, idx) => ({
    ...res,
    ranking: idx + 1,
  }));
}
