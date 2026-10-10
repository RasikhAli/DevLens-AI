import { validateSafeUrl } from "./ssrf-filter";

export interface ScrapedProjectItem {
  name: string;
  description: string;
  liveUrl?: string;
  repositoryUrl?: string;
  technologies: string[];
}

export interface ScrapedPortfolioResult {
  url: string;
  title: string;
  description: string;
  rawText: string;
  detectedTechnologies: string[];
  projects: ScrapedProjectItem[];
  externalLinks: {
    githubUrl?: string;
    linkedinUrl?: string;
    demoUrls: string[];
  };
}

export class PortfolioScraper {
  public static async scrapeUrl(targetUrl: string): Promise<ScrapedPortfolioResult> {
    const validation = validateSafeUrl(targetUrl);
    if (!validation.isAllowed || !validation.sanitizedUrl) {
      throw new Error(`Security validation failed: ${validation.reason || "Forbidden URL"}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const response = await fetch(validation.sanitizedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DevLens-AI-Bot/1.0; +https://devlens.ai)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        throw new Error(`Invalid content type: expected HTML but received "${contentType}"`);
      }

      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";

      // Extract meta description
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = metaDescMatch ? metaDescMatch[1].trim() : "";

      // Extract all GitHub links (profile and repository links)
      const githubLinks = Array.from(
        html.matchAll(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_.-]+))?/gi)
      );
      const githubProfile = githubLinks.find((m) => !m[2])?.[0] || githubLinks[0]?.[0];

      // Extract LinkedIn links
      const linkedinMatch = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

      // Extract all demo links
      const demoMatches = Array.from(
        html.matchAll(/href=["'](https?:\/\/[^"']+\.(?:vercel\.app|netlify\.app|fly\.dev|pages\.dev|io|app)[^"']*)["']/gi)
      ).map((m) => m[1]);

      // Detect all prominent technology keywords
      const commonTechs = [
        "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
        "PostgreSQL", "Tailwind CSS", "Docker", "GraphQL", "AWS", "Prisma",
        "Vue", "Go", "Rust", "FastAPI", "MongoDB", "Redis", "Kubernetes"
      ];
      const detectedTechnologies = commonTechs.filter((tech) =>
        new RegExp(`\\b${tech}\\b`, "i").test(html)
      );

      // Extract projects from HTML blocks and repository links
      const extractedProjects: ScrapedProjectItem[] = [];

      // 1. Every distinct GitHub repo mentioned on the portfolio is a project
      for (const gm of githubLinks) {
        const repoName = gm[2];
        if (repoName && !extractedProjects.some((p) => p.name.toLowerCase() === repoName.toLowerCase())) {
          extractedProjects.push({
            name: repoName,
            description: `Project repository linked from portfolio at ${validation.sanitizedUrl}`,
            repositoryUrl: gm[0],
            technologies: detectedTechnologies.slice(0, 4),
          });
        }
      }

      // 2. Extract project cards from HTML headings (h2, h3 within project contexts)
      const projectHeadings = Array.from(html.matchAll(/<(?:h2|h3|h4)[^>]*>([^<]{3,40})<\/(?:h2|h3|h4)>/gi))
        .map((m) => m[1].trim())
        .filter((name) => !/^(about|experience|contact|skills|education|socials|links|get in touch)$/i.test(name));

      for (const h of projectHeadings) {
        if (!extractedProjects.some((p) => p.name.toLowerCase() === h.toLowerCase())) {
          extractedProjects.push({
            name: h,
            description: `Showcase project documented on developer portfolio`,
            liveUrl: demoMatches[extractedProjects.length] || undefined,
            technologies: detectedTechnologies.slice(0, 3),
          });
        }
      }

      // Strip tags for clean summary text
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return {
        url: validation.sanitizedUrl,
        title,
        description,
        rawText: cleanText.slice(0, 5000),
        detectedTechnologies,
        projects: extractedProjects,
        externalLinks: {
          githubUrl: githubProfile,
          linkedinUrl: linkedinMatch ? linkedinMatch[0] : undefined,
          demoUrls: Array.from(new Set(demoMatches)),
        },
      };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") {
        throw new Error("Portfolio website request timed out after 8 seconds.");
      }
      throw new Error(`Failed to scrape portfolio website: ${err?.message || "Connection failed"}`);
    }
  }
}
