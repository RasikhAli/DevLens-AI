import { NextResponse } from "next/server";
import { dbStore } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { normalizeSkill } from "@/lib/skills/normalizer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = dbStore.getProfileById(id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const profile = dbStore.getProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();

    // Update mutable fields
    if (body.name !== undefined) profile.name = body.name;
    if (body.headline !== undefined) profile.headline = body.headline;
    if (body.summary !== undefined) profile.summary = body.summary;
    if (body.email !== undefined) profile.email = body.email;
    if (body.location !== undefined) profile.location = body.location;
    if (body.websiteUrl !== undefined) profile.websiteUrl = body.websiteUrl;
    if (body.githubUsername !== undefined) profile.githubUsername = body.githubUsername;
    if (body.linkedinUrl !== undefined) profile.linkedinUrl = body.linkedinUrl;

    if (Array.isArray(body.skills)) {
      profile.skills = body.skills.map((s: string | any, idx: number) => {
        const name = typeof s === "string" ? s : s.canonicalName || s.name;
        const norm = normalizeSkill(name);
        return {
          id: s.id || `sk_${Date.now()}_${idx}`,
          developerProfileId: id,
          canonicalName: norm.canonicalName,
          category: norm.category,
          claimedProficiency: s.claimedProficiency || "Mid",
          evidenceStatus: s.evidenceStatus || "CLAIMED",
        };
      });
    }

    profile.updatedAt = new Date().toISOString();
    dbStore.saveProfile(profile);

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // Check role permissions: if logged in as VIEWER, reject
    if (user && user.role === "VIEWER") {
      return NextResponse.json({ error: "Unauthorized: View-only users cannot delete candidate profiles." }, { status: 403 });
    }

    const deleted = dbStore.deleteProfile(id);
    if (!deleted) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete profile" }, { status: 500 });
  }
}
