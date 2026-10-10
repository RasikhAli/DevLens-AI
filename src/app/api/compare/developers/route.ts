import { NextResponse } from "next/server";
import { z } from "zod";
import { dbStore, type StoredDeveloperProfile } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

const CompareDevelopersSchema = z.object({
  developerIds: z.array(z.string()).min(2, "Select at least 2 developers to compare"),
  title: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = CompareDevelopersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid developer selection", details: parsed.error.flatten() }, { status: 400 });
    }

    const { developerIds, title } = parsed.data;

    // Fetch developer profiles
    const profiles: StoredDeveloperProfile[] = [];
    for (const id of developerIds) {
      const p = dbStore.getProfileById(id);
      if (p) profiles.push(p);
    }

    if (profiles.length < 2) {
      return NextResponse.json({ error: "At least 2 valid developer profiles required" }, { status: 400 });
    }

    // Build skill union and matrix
    const allSkillsMap = new Map<string, { category: string; profiles: Record<string, { status: string; proficiency?: string | null }> }>();

    for (const prof of profiles) {
      for (const sk of prof.skills) {
        if (!allSkillsMap.has(sk.canonicalName)) {
          allSkillsMap.set(sk.canonicalName, {
            category: sk.category,
            profiles: {},
          });
        }
        allSkillsMap.get(sk.canonicalName)!.profiles[prof.id] = {
          status: sk.evidenceStatus,
          proficiency: sk.claimedProficiency,
        };
      }
    }

    const skillMatrix = Array.from(allSkillsMap.entries()).map(([skillName, data]) => ({
      skillName,
      category: data.category,
      developerPresence: profiles.map((p) => ({
        developerId: p.id,
        developerName: p.name,
        hasSkill: !!data.profiles[p.id],
        status: data.profiles[p.id]?.status || "NONE",
        proficiency: data.profiles[p.id]?.proficiency || null,
      })),
    }));

    // Engineering practice comparison
    const engineeringMatrix = profiles.map((p) => {
      const testedRepos = p.projects.filter((pr) => pr.hasTests).length;
      const ciRepos = p.projects.filter((pr) => pr.hasCI).length;
      const docRepos = p.projects.filter((pr) => pr.hasDocs).length;
      const avgComplexity = p.projects.length
        ? Math.round(p.projects.reduce((sum, pr) => sum + (pr.complexityScore || 50), 0) / p.projects.length)
        : 0;

      return {
        developerId: p.id,
        developerName: p.name,
        totalProjects: p.projects.length,
        testedProjectsCount: testedRepos,
        ciEnabledCount: ciRepos,
        documentedCount: docRepos,
        averageComplexityScore: avgComplexity,
        totalVerifiedEvidenceCount: p.evidences.filter((e) => e.verificationStatus === "SOURCE_OBSERVED").length,
      };
    });

    // Profile summary comparison
    const summaries = profiles.map((p) => ({
      id: p.id,
      name: p.name,
      headline: p.headline,
      completeness: p.completeness,
      topSkills: p.skills.slice(0, 5).map((s) => s.canonicalName),
      experiencesCount: p.experiences.length,
      projectsCount: p.projects.length,
      evidenceCount: p.evidences.length,
    }));

    const comparisonRecord = dbStore.saveComparison({
      id: `cmp_${Date.now()}`,
      ownerId,
      title: title || `Comparison: ${profiles.map((p) => p.name).join(" vs ")}`,
      comparisonType: "DEVELOPER_VS_DEVELOPER",
      createdAt: new Date().toISOString(),
      results: [],
    });

    return NextResponse.json({
      comparisonId: comparisonRecord.id,
      title: comparisonRecord.title,
      profiles: summaries,
      skillMatrix,
      engineeringMatrix,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Comparison failed" }, { status: 500 });
  }
}
