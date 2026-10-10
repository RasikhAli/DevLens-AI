import { NextResponse } from "next/server";
import { z } from "zod";
import { PortfolioScraper } from "@/lib/integrations/portfolio/scraper";
import { normalizeSkill } from "@/lib/skills/normalizer";
import { dbStore, type StoredDeveloperProfile, type StoredProfileSource } from "@/lib/data/store";
import { getSessionUser } from "@/lib/auth/session";

const PortfolioImportSchema = z.object({
  url: z.string().url("Valid HTTP or HTTPS website URL is required"),
  profileId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const ownerId = user ? user.id : "demo-user-1";

    const body = await request.json();
    const parsed = PortfolioImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL", details: parsed.error.flatten() }, { status: 400 });
    }

    const { url, profileId: existingProfileId } = parsed.data;

    // 1. Scrape with SSRF protection
    const scraped = await PortfolioScraper.scrapeUrl(url);

    // 2. Find or create profile
    let profile: StoredDeveloperProfile;
    const profileId = existingProfileId || `prof_${Date.now()}`;

    if (existingProfileId) {
      const existing = dbStore.getProfileById(existingProfileId);
      if (!existing) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      profile = existing;
    } else {
      profile = {
        id: profileId,
        ownerId,
        name: scraped.title || "Portfolio Candidate",
        headline: scraped.description || "Software Developer",
        summary: scraped.description || "",
        websiteUrl: scraped.url,
        githubUsername: scraped.externalLinks.githubUrl ? scraped.externalLinks.githubUrl.split("/").pop() : null,
        linkedinUrl: scraped.externalLinks.linkedinUrl || null,
        completeness: 65,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sources: [],
        skills: [],
        experiences: [],
        projects: [],
        evidences: [],
      };
    }

    profile.websiteUrl = scraped.url;

    const sourceId = `src_${Date.now()}`;
    const sourceRecord: StoredProfileSource = {
      id: sourceId,
      developerProfileId: profileId,
      sourceType: "PORTFOLIO_WEBSITE",
      sourceUrl: scraped.url,
      status: "COMPLETED",
      rawContent: scraped.rawText,
      lastFetchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    profile.sources.push(sourceRecord);

    // 3. Ingest detected technologies
    for (const tech of scraped.detectedTechnologies) {
      const norm = normalizeSkill(tech);
      const exists = profile.skills.some((s) => s.canonicalName.toLowerCase() === norm.canonicalName.toLowerCase());
      if (!exists) {
        profile.skills.push({
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          canonicalName: norm.canonicalName,
          category: norm.category,
          claimedProficiency: "Mid",
          evidenceStatus: "CLAIMED",
        });

        profile.evidences.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          sourceId,
          claimType: "SKILL",
          claimValue: `Observed reference to ${norm.canonicalName} on portfolio website`,
          sourceExcerpt: `Found in portfolio page text at ${scraped.url}`,
          confidence: 0.85,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Ingest all scraped projects from portfolio
    for (const proj of scraped.projects) {
      const exists = profile.projects.some((p) => p.name.toLowerCase() === proj.name.toLowerCase());
      if (!exists) {
        profile.projects.push({
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          name: proj.name,
          description: proj.description,
          repositoryUrl: proj.repositoryUrl || null,
          liveUrl: proj.liveUrl || null,
          technologies: proj.technologies,
          complexityScore: 70,
          hasTests: false,
          hasCI: false,
          hasDocs: true,
        });

        profile.evidences.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          developerProfileId: profileId,
          sourceId,
          claimType: "PROJECT",
          claimValue: `Documented project "${proj.name}" verified from portfolio`,
          sourceExcerpt: `Found on ${scraped.url}: ${proj.description}`,
          repositoryRef: proj.repositoryUrl || proj.liveUrl || null,
          confidence: 0.9,
          verificationStatus: "SOURCE_OBSERVED",
          observedAt: new Date().toISOString(),
        });
      }
    }

    profile.completeness = Math.min(100, Math.max(50, profile.skills.length * 5 + profile.projects.length * 8));
    profile.updatedAt = new Date().toISOString();

    dbStore.saveProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
      scrapedTitle: scraped.title,
      technologiesFound: scraped.detectedTechnologies,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Portfolio import failed" }, { status: 500 });
  }
}
