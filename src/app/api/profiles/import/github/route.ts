import { NextResponse } from "next/server";
import { z } from "zod";
import { GitHubClient } from "@/lib/integrations/github/client";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { dbStore, type StoredDeveloperProfile, type StoredProfileSource } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

const GitHubImportSchema = z.object({
  username: z.string().min(1, "GitHub username or profile URL is required"),
  profileId: z.string().optional(),
  token: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = GitHubImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid username", details: parsed.error.flatten() }, { status: 400 });
    }

    const { username, profileId: existingProfileId, token } = parsed.data;
    const client = new GitHubClient(token);

    // 1. Analyze GitHub profile and repos
    const ghData = await client.analyzeProfile(username);

    // 2. Find or create profile
    let profile: StoredDeveloperProfile;
    const profileId = existingProfileId || `prof_${Date.now()}`;

    if (existingProfileId) {
      const existing = dbStore.getProfileById(existingProfileId);
      if (!existing) {
        return NextResponse.json({ error: "Specified profile not found" }, { status: 404 });
      }
      profile = existing;
    } else {
      profile = {
        id: profileId,
        ownerId,
        name: ghData.name || ghData.username,
        headline: ghData.bio || "Open Source Developer",
        summary: ghData.bio || "",
        githubUsername: ghData.username,
        websiteUrl: ghData.blogUrl || null,
        location: ghData.location || null,
        completeness: 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sources: [],
        skills: [],
        experiences: [],
        projects: [],
        evidences: [],
      };
    }

    profile.githubUsername = ghData.username;

    const sourceId = `src_${Date.now()}`;
    const sourceRecord: StoredProfileSource = {
      id: sourceId,
      developerProfileId: profileId,
      sourceType: "GITHUB_PROFILE",
      sourceUrl: `https://github.com/${ghData.username}`,
      status: "COMPLETED",
      lastFetchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    profile.sources.push(sourceRecord);

    // 3. Ingest top languages as verified skills
    for (const item of ghData.topLanguages) {
      const norm = normalizeSkill(item.language);
      const exists = profile.skills.some((s) => s.canonicalName.toLowerCase() === norm.canonicalName.toLowerCase());
      if (!exists) {
        profile.skills.push({
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          canonicalName: norm.canonicalName,
          category: norm.category,
          claimedProficiency: item.count >= 3 ? "Senior" : "Mid",
          evidenceStatus: "VERIFIED",
        });

        profile.evidences.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          sourceId,
          claimType: "SKILL",
          claimValue: `Observed ${norm.canonicalName} as primary language across ${item.count} public repositories`,
          repositoryRef: `github.com/${ghData.username}`,
          confidence: 0.95,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Ingest analyzed repositories as projects with verified test/CI evidence
    for (const repo of ghData.analyzedRepos) {
      const exists = profile.projects.some((p) => p.name.toLowerCase() === repo.name.toLowerCase());
      if (!exists) {
        profile.projects.push({
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          name: repo.name,
          description: repo.description,
          repositoryUrl: repo.url,
          liveUrl: null,
          technologies: repo.primaryLanguage ? [repo.primaryLanguage, ...repo.topics] : repo.topics,
          complexityScore: repo.estimatedComplexity,
          hasTests: repo.hasTests,
          hasCI: repo.hasCI,
          hasDocs: repo.hasDocs,
          starsCount: repo.stars,
          primaryLanguage: repo.primaryLanguage,
        });

        if (repo.hasTests) {
          profile.evidences.push({
            id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            developerProfileId: profileId,
            sourceId,
            claimType: "ENGINEERING_PRACTICE",
            claimValue: `Automated test configuration detected in repository "${repo.name}": ${repo.testEvidence}`,
            repositoryRef: repo.url,
            confidence: 0.9,
            verificationStatus: "SOURCE_OBSERVED",
            observedAt: new Date().toISOString(),
          });
        }

        if (repo.hasCI) {
          profile.evidences.push({
            id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            developerProfileId: profileId,
            sourceId,
            claimType: "ENGINEERING_PRACTICE",
            claimValue: `Continuous integration workflow (.github/workflows) verified in repository "${repo.name}"`,
            repositoryRef: repo.url,
            confidence: 1.0,
            verificationStatus: "SOURCE_OBSERVED",
            observedAt: new Date().toISOString(),
          });
        }
      }
    }

    profile.completeness = Math.min(100, Math.max(60, profile.skills.length * 6 + profile.projects.length * 8));
    profile.updatedAt = new Date().toISOString();

    dbStore.saveProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
      analyzedReposCount: ghData.analyzedRepos.length,
      engineeringPractices: ghData.engineeringPractices,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "GitHub import failed" }, { status: 500 });
  }
}
