import { NextResponse } from "next/server";
import { z } from "zod";
import { dbStore, type StoredDeveloperProfile } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";
import { normalizeSkill } from "@/lib/skills/normalizer";

const CreateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().optional(),
  summary: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();
    const skillFilter = searchParams.get("skill")?.toLowerCase();

    let profiles = dbStore.getProfiles(ownerId);

    if (query) {
      profiles = profiles.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.headline?.toLowerCase().includes(query) ||
          p.summary?.toLowerCase().includes(query) ||
          p.skills.some((s) => s.canonicalName.toLowerCase().includes(query))
      );
    }

    if (skillFilter) {
      profiles = profiles.filter((p) =>
        p.skills.some((s) => s.canonicalName.toLowerCase() === skillFilter)
      );
    }

    return NextResponse.json({ profiles });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = CreateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, headline, summary, email, location, websiteUrl, githubUsername, linkedinUrl, skills } = parsed.data;

    const profileId = `prof_${Date.now()}`;
    const normalizedSkills = skills.map((s, idx) => {
      const norm = normalizeSkill(s);
      return {
        id: `sk_${Date.now()}_${idx}`,
        developerProfileId: profileId,
        canonicalName: norm.canonicalName,
        category: norm.category,
        claimedProficiency: "Mid",
        evidenceStatus: "CLAIMED" as const,
      };
    });

    const newProfile: StoredDeveloperProfile = {
      id: profileId,
      ownerId,
      name,
      headline: headline || "Software Engineer",
      summary: summary || "",
      email: email || null,
      location: location || null,
      websiteUrl: websiteUrl || null,
      githubUsername: githubUsername || null,
      linkedinUrl: linkedinUrl || null,
      completeness: Math.min(100, 40 + normalizedSkills.length * 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sources: [
        {
          id: `src_${Date.now()}`,
          developerProfileId: profileId,
          sourceType: "MANUAL_ENTRY",
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
        },
      ],
      skills: normalizedSkills,
      experiences: [],
      projects: [],
      evidences: [],
    };

    dbStore.saveProfile(newProfile);

    return NextResponse.json({ profile: newProfile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create profile" }, { status: 500 });
  }
}
