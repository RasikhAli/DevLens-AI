import { NextResponse } from "next/server";
import { z } from "zod";
import { dbStore, type StoredDeveloperProfile, type StoredComparison } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { rankCandidatesAgainstJob } from "@/lib/scoring/engine";
import type { DeveloperEvaluationInput, JobEvaluationCriteria } from "@/lib/scoring/types";

const JobMatchSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  developerIds: z.array(z.string()).min(1, "Select at least 1 candidate to evaluate"),
  weights: z.object({
    techSkills: z.number().optional(),
    projectRelevance: z.number().optional(),
    experienceAlignment: z.number().optional(),
    engineeringPractices: z.number().optional(),
    otherRequirements: z.number().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = JobMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid match request", details: parsed.error.flatten() }, { status: 400 });
    }

    const { jobId, developerIds, weights } = parsed.data;

    // Fetch Job
    const job = dbStore.getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Fetch Candidates
    const candidatesInput: DeveloperEvaluationInput[] = [];
    for (const devId of developerIds) {
      const p = dbStore.getProfileById(devId);
      if (p) {
        candidatesInput.push({
          id: p.id,
          name: p.name,
          skills: p.skills.map((s) => ({
            name: s.canonicalName,
            evidenceStatus: s.evidenceStatus,
          })),
          projects: p.projects.map((pr) => ({
            name: pr.name,
            description: pr.description,
            technologies: pr.technologies,
            hasTests: pr.hasTests,
            hasCI: pr.hasCI,
            hasDocs: pr.hasDocs,
            complexityScore: pr.complexityScore,
            starsCount: pr.starsCount,
          })),
          experiences: p.experiences.map((exp) => ({
            employer: exp.employer,
            title: exp.title,
            description: exp.description,
            technologies: exp.technologies,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
          })),
          evidences: p.evidences.map((e) => ({
            claimType: e.claimType,
            claimValue: e.claimValue,
            sourceExcerpt: e.sourceExcerpt,
            verificationStatus: e.verificationStatus,
            confidence: e.confidence,
          })),
        });
      }
    }

    if (candidatesInput.length === 0) {
      return NextResponse.json({ error: "No valid developer profiles selected" }, { status: 400 });
    }

    const criteria: JobEvaluationCriteria = {
      id: job.id,
      title: job.title,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      requiredExperienceYears: job.requiredExperience,
      domainRequirements: job.domainRequirements,
      weights: weights || job.scoringWeights,
    };

    // Run 100% deterministic ranking
    const rankings = rankCandidatesAgainstJob(candidatesInput, criteria);

    // Save comparison
    const comparisonId = `cmp_${Date.now()}`;
    const comparisonRecord: StoredComparison = {
      id: comparisonId,
      ownerId,
      jobId: job.id,
      title: `Job Match: ${job.title} (${candidatesInput.length} candidates)`,
      comparisonType: candidatesInput.length > 1 ? "DEVELOPERS_VS_JOB" : "DEVELOPER_VS_JOB",
      configuration: { weights: criteria.weights },
      createdAt: new Date().toISOString(),
      results: rankings.map((r) => ({
        id: `res_${Date.now()}_${r.developerProfileId}`,
        developerProfileId: r.developerProfileId,
        developerName: r.developerName,
        totalScore: r.totalScore,
        categoryScores: r.categories,
        evidenceCoverage: r.evidenceCoverage,
        strengths: r.strengths,
        gaps: r.gaps,
        explanation: r.explanation,
        ranking: r.ranking || 1,
      })),
    };

    dbStore.saveComparison(comparisonRecord);

    return NextResponse.json({
      comparisonId,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
      },
      weights: criteria.weights,
      rankings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Job matching calculation failed" }, { status: 500 });
  }
}
