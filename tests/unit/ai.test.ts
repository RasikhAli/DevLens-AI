import { describe, it, expect } from "vitest";
import { MockAIProvider } from "../../src/lib/ai/mock-provider";

describe("AI Integration Provider", () => {
  const provider = new MockAIProvider();

  it("parses resume text into structured validated profile", async () => {
    const sampleResume = `
      Alex Mercer
      alex.mercer@example.com
      555-0199-234

      Professional Summary:
      Full-stack software engineer with 6 years experience in TypeScript, React, PostgreSQL, Docker, and Node.js.
      Experience:
      Senior Developer at CloudTech Corp (2021-Present)
      Developed high-throughput APIs using FastAPI and PostgreSQL with unit tests and Docker CI.
    `;

    const result = await provider.parseResume(sampleResume);
    expect(result.name).toBe("Alex Mercer");
    expect(result.email).toBe("alex.mercer@example.com");
    expect(result.skills).toContain("TypeScript");
    expect(result.skills).toContain("React");
    expect(result.skills).toContain("PostgreSQL");
    expect(result.experiences.length).toBeGreaterThan(0);
  });

  it("parses job description into validated requirements", async () => {
    const sampleJob = `
      Senior Backend Engineer
      We are looking for a backend engineer with 5+ years of experience in Python, FastAPI, Docker, and PostgreSQL.
      Must have experience with automated testing and Kubernetes.
    `;

    const result = await provider.parseJob(sampleJob);
    expect(result.title).toBe("Senior Backend Engineer");
    expect(result.requiredSkills).toContain("Python");
    expect(result.requiredSkills).toContain("PostgreSQL");
    expect(result.requiredExperienceYears).toBe(5);
  });

  it("generates grounded advice for match gaps", async () => {
    const advice = await provider.generateMatchAdvice({
      developerName: "Alex Mercer",
      jobTitle: "Senior DevOps Specialist",
      totalScore: 68,
      matchedSkills: ["Docker"],
      missingSkills: ["Kubernetes", "Terraform"],
      strengths: ["Strong containerization foundation"],
      gaps: ["Missing Kubernetes production experience"],
    });

    expect(advice.recommendedActions.length).toBeGreaterThan(0);
    expect(advice.suggestedPortfolioProjects.length).toBeGreaterThan(0);
    expect(advice.learningRecommendations.length).toBeGreaterThan(0);
  });
});
