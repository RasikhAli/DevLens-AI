import { describe, it, expect } from "vitest";
import { normalizeSkill, areSkillsRelated, normalizeSkillList } from "../../src/lib/skills/normalizer";
import {
  evaluateCandidateAgainstJob,
  rankCandidatesAgainstJob,
  normalizeWeights,
} from "../../src/lib/scoring/engine";
import type { DeveloperEvaluationInput, JobEvaluationCriteria } from "../../src/lib/scoring/types";

describe("Skill Normalizer", () => {
  it("normalizes common aliases to canonical names", () => {
    expect(normalizeSkill("ts").canonicalName).toBe("TypeScript");
    expect(normalizeSkill("js").canonicalName).toBe("JavaScript");
    expect(normalizeSkill("postgres").canonicalName).toBe("PostgreSQL");
    expect(normalizeSkill("k8s").canonicalName).toBe("Kubernetes");
    expect(normalizeSkill("react.js").canonicalName).toBe("React");
    expect(normalizeSkill("node").canonicalName).toBe("Node.js");
  });

  it("handles unknown skills cleanly with title casing", () => {
    const res = normalizeSkill("custom-internal-framework");
    expect(res.canonicalName).toBe("Custom Internal Framework");
    expect(res.isRecognized).toBe(false);
  });

  it("identifies semantically related skills", () => {
    expect(areSkillsRelated("TypeScript", "JavaScript")).toBe(true);
    expect(areSkillsRelated("React", "Vue.js")).toBe(true);
    expect(areSkillsRelated("Express.js", "Fastify")).toBe(true);
    expect(areSkillsRelated("Go", "Python")).toBe(false);
  });

  it("deduplicates skill arrays", () => {
    const list = normalizeSkillList(["ts", "TypeScript", "postgres", "PostgreSQL"]);
    expect(list.length).toBe(2);
    expect(list.map((s) => s.canonicalName)).toEqual(["TypeScript", "PostgreSQL"]);
  });
});

describe("Deterministic Scoring Engine", () => {
  it("normalizes weights to sum to 100", () => {
    const normalized = normalizeWeights({
      techSkills: 50,
      projectRelevance: 50,
      experienceAlignment: 0,
      engineeringPractices: 0,
      otherRequirements: 0,
    });
    expect(normalized.techSkills).toBe(50);
    expect(normalized.projectRelevance).toBe(50);
  });

  const mockJob: JobEvaluationCriteria = {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    requiredSkills: ["TypeScript", "React", "PostgreSQL", "Node.js"],
    preferredSkills: ["Docker", "Kubernetes"],
    requiredExperienceYears: 4,
    domainRequirements: ["SaaS"],
  };

  const strongCandidate: DeveloperEvaluationInput = {
    id: "dev-1",
    name: "Alice Developer",
    skills: [
      { name: "TypeScript", evidenceStatus: "VERIFIED" },
      { name: "React", evidenceStatus: "VERIFIED" },
      { name: "PostgreSQL", evidenceStatus: "VERIFIED" },
      { name: "Node.js", evidenceStatus: "VERIFIED" },
      { name: "Docker", evidenceStatus: "CLAIMED" },
    ],
    projects: [
      {
        name: "Analytics Platform",
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        hasTests: true,
        hasCI: true,
        hasDocs: true,
      },
    ],
    experiences: [
      {
        employer: "CloudTech",
        title: "Senior Software Engineer",
        description: "Built scalable SaaS data pipelines",
        technologies: ["TypeScript", "Node.js", "PostgreSQL"],
      },
    ],
    evidences: [],
  };

  const juniorCandidate: DeveloperEvaluationInput = {
    id: "dev-2",
    name: "Bob Junior",
    skills: [
      { name: "JavaScript", evidenceStatus: "CLAIMED" }, // Transferable to TS
      { name: "HTML", evidenceStatus: "CLAIMED" },
    ],
    projects: [],
    experiences: [],
    evidences: [],
  };

  it("evaluates strong candidate with high score and verified evidence", () => {
    const evalResult = evaluateCandidateAgainstJob(strongCandidate, mockJob);
    expect(evalResult.totalScore).toBeGreaterThan(75);
    expect(evalResult.categories.techSkills.score).toBeGreaterThanOrEqual(90);
    expect(evalResult.categories.engineeringPractices.score).toBeGreaterThanOrEqual(70);
    expect(evalResult.strengths.length).toBeGreaterThan(0);
    expect(evalResult.evidenceCoverage).toBeGreaterThan(50);
  });

  it("applies missing data policy fairly for candidates with sparse data", () => {
    const evalResult = evaluateCandidateAgainstJob(juniorCandidate, mockJob);
    // Missing data should not be zero, but reflects gaps and limitations
    expect(evalResult.totalScore).toBeLessThan(60);
    expect(evalResult.limitations.length).toBeGreaterThan(0);
    expect(evalResult.gaps.length).toBeGreaterThan(0);
  });

  it("ranks multiple candidates correctly in descending order", () => {
    const rankings = rankCandidatesAgainstJob([juniorCandidate, strongCandidate], mockJob);
    expect(rankings[0].developerProfileId).toBe("dev-1");
    expect(rankings[0].ranking).toBe(1);
    expect(rankings[1].developerProfileId).toBe("dev-2");
    expect(rankings[1].ranking).toBe(2);
  });
});
