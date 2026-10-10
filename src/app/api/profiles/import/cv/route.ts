import { NextResponse } from "next/server";
import { DocumentExtractor } from "@/lib/integrations/documents/extractor";
import { aiProvider } from "@/lib/ai/provider";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { dbStore, type StoredDeveloperProfile, type StoredEvidence, type StoredProfileSource } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const existingProfileId = formData.get("profileId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No document file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Safe extraction
    const extraction = await DocumentExtractor.extractDocument(buffer, file.name, file.type);

    // 2. AI Structured parsing
    const parsed = await aiProvider.parseResume(extraction.text);

    // 3. Find or create profile
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
        name: parsed.name || "Imported Candidate",
        headline: parsed.headline || "Software Engineer",
        summary: parsed.summary || "",
        email: parsed.email || null,
        phone: parsed.phone || null,
        location: parsed.location || null,
        completeness: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sources: [],
        skills: [],
        experiences: [],
        projects: [],
        evidences: [],
      };
    }

    const sourceId = `src_${Date.now()}`;
    const sourceRecord: StoredProfileSource = {
      id: sourceId,
      developerProfileId: profileId,
      sourceType: "CV_DOCUMENT",
      status: "COMPLETED",
      fileName: file.name,
      fileSize: file.size,
      rawContent: extraction.text.slice(0, 10000),
      createdAt: new Date().toISOString(),
    };
    profile.sources.push(sourceRecord);

    // 4. Merge skills
    for (const rawSkill of parsed.skills) {
      const norm = normalizeSkill(rawSkill);
      const exists = profile.skills.some((s) => s.canonicalName.toLowerCase() === norm.canonicalName.toLowerCase());
      if (!exists) {
        profile.skills.push({
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          canonicalName: norm.canonicalName,
          category: norm.category,
          claimedProficiency: "Senior",
          evidenceStatus: "CLAIMED",
        });

        // Add traceable evidence for each extracted skill from CV
        profile.evidences.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          sourceId,
          claimType: "SKILL",
          claimValue: `Documented experience with ${norm.canonicalName}`,
          sourceExcerpt: `Extracted from uploaded resume document "${file.name}"`,
          confidence: 0.9,
          verificationStatus: "USER_PROVIDED",
          observedAt: new Date().toISOString(),
        });
      }
    }

    // 5. Merge experiences
    for (const exp of parsed.experiences) {
      profile.experiences.push({
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        developerProfileId: profileId,
        employer: exp.employer,
        title: exp.title,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        technologies: exp.technologies,
      });
    }

    // 6. Merge projects with traceable evidence
    for (const proj of parsed.projects) {
      profile.projects.push({
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        developerProfileId: profileId,
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies,
        repositoryUrl: proj.repositoryUrl || null,
        liveUrl: proj.liveUrl || null,
        hasTests: false,
        hasCI: false,
        hasDocs: true,
      });

      profile.evidences.push({
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        developerProfileId: profileId,
        sourceId,
        claimType: "PROJECT",
        claimValue: `Documented project "${proj.name}" (${proj.technologies.slice(0, 3).join(", ")})`,
        sourceExcerpt: `Documented in resume file "${file.name}": ${proj.description.slice(0, 150)}`,
        repositoryRef: proj.repositoryUrl || null,
        confidence: 0.9,
        verificationStatus: "USER_PROVIDED",
        observedAt: new Date().toISOString(),
      });
    }

    profile.completeness = Math.min(100, Math.max(50, profile.skills.length * 5 + profile.projects.length * 6 + profile.experiences.length * 8));
    profile.updatedAt = new Date().toISOString();

    dbStore.saveProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
      extractedWords: extraction.wordCount,
      skillsFound: parsed.skills.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "CV import failed" }, { status: 500 });
  }
}
