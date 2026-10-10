import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = dbStore.getJobById(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = dbStore.getJobById(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await request.json();
    if (body.title !== undefined) job.title = body.title;
    if (body.company !== undefined) job.company = body.company;
    if (body.description !== undefined) job.description = body.description;
    if (body.requiredSkills !== undefined) job.requiredSkills = body.requiredSkills;
    if (body.preferredSkills !== undefined) job.preferredSkills = body.preferredSkills;
    if (body.requiredExperience !== undefined) job.requiredExperience = body.requiredExperience;
    if (body.domainRequirements !== undefined) job.domainRequirements = body.domainRequirements;
    if (body.scoringWeights !== undefined) job.scoringWeights = body.scoringWeights;

    job.updatedAt = new Date().toISOString();
    dbStore.saveJob(job);

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    if (user && user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized: View-only users cannot delete job postings." }, { status: 403 });
    }

    const deleted = dbStore.deleteJob(id);
    if (!deleted) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete job" }, { status: 500 });
  }
}
