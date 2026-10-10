import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";
import { aiProvider } from "@/lib/ai/provider";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const job = dbStore.getJobById(id);

    const textToParse = body.description || (job ? job.description : "");
    if (!textToParse) {
      return NextResponse.json({ error: "No job description text provided" }, { status: 400 });
    }

    const parsed = await aiProvider.parseJob(textToParse);

    if (job) {
      job.requiredSkills = parsed.requiredSkills;
      job.preferredSkills = parsed.preferredSkills;
      job.requiredExperience = parsed.requiredExperienceYears || job.requiredExperience;
      job.domainRequirements = parsed.domainRequirements;
      job.updatedAt = new Date().toISOString();
      dbStore.saveJob(job);
    }

    return NextResponse.json({
      success: true,
      parsed,
      job,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to parse job description" }, { status: 500 });
  }
}
