import { NextResponse } from "next/server";
import { z } from "zod";
import { dbStore, type StoredJob } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { normalizeSkill } from "@/lib/skills/normalizer";

const CreateJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().optional(),
  description: z.string().min(10, "Job description must be at least 10 characters"),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  requiredExperience: z.number().default(3),
  domainRequirements: z.array(z.string()).default([]),
  scoringWeights: z.object({
    techSkills: z.number().default(35),
    projectRelevance: z.number().default(25),
    experienceAlignment: z.number().default(20),
    engineeringPractices: z.number().default(10),
    otherRequirements: z.number().default(10),
  }).optional(),
});

export async function GET() {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";
    const jobs = dbStore.getJobs(ownerId);
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = CreateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      company,
      description,
      requiredSkills,
      preferredSkills,
      requiredExperience,
      domainRequirements,
      scoringWeights,
    } = parsed.data;

    const normalizedReq = requiredSkills.map((s) => normalizeSkill(s).canonicalName);
    const normalizedPref = preferredSkills.map((s) => normalizeSkill(s).canonicalName);

    const newJob: StoredJob = {
      id: `job_${Date.now()}`,
      ownerId,
      title,
      company: company || null,
      description,
      requiredSkills: normalizedReq,
      preferredSkills: normalizedPref,
      requiredExperience,
      domainRequirements,
      scoringWeights: scoringWeights || {
        techSkills: 35,
        projectRelevance: 25,
        experienceAlignment: 20,
        engineeringPractices: 10,
        otherRequirements: 10,
      },
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.saveJob(newJob);

    return NextResponse.json({ job: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create job" }, { status: 500 });
  }
}
