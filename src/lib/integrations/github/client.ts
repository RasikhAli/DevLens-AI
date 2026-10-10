import { env } from "../../env";

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  default_branch: string;
  homepage?: string | null;
  license?: { name: string; spdx_id: string } | null;
}

export interface GitHubRepoAnalysis {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  hasTests: boolean;
  hasCI: boolean;
  hasDocs: boolean;
  testEvidence: string | null;
  ciEvidence: string | null;
  estimatedComplexity: number; // 0 to 100
}

export interface GitHubProfileAnalysisResult {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  location: string | null;
  blogUrl: string | null;
  publicRepoCount: number;
  topLanguages: { language: string; count: number }[];
  analyzedRepos: GitHubRepoAnalysis[];
  engineeringPractices: {
    testedReposCount: number;
    ciEnabledReposCount: number;
    documentedReposCount: number;
  };
}

export class GitHubClient {
  private token?: string;

  constructor(token?: string) {
    this.token = token || env.GITHUB_TOKEN;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevLens-AI-Profile-Analyzer",
    };
    if (this.token && this.token.trim().length > 0) {
      headers.Authorization = `token ${this.token.trim()}`;
    }
    return headers;
  }

  /**
   * Cleans input to extract a valid username from either raw username or full github URL
   */
  public static extractUsername(input: string): string {
    const cleaned = input.trim().replace(/^@/, "");
    try {
      if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
        const url = new URL(cleaned);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || cleaned;
      }
    } catch {
      // not a URL, return cleaned string
    }
    return cleaned;
  }

  /**
   * Fetch public user profile
   */
  public async getUser(username: string): Promise<GitHubUserProfile> {
    const cleanUser = GitHubClient.extractUsername(username);
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, {
      headers: this.getHeaders(),
    });

    if (res.status === 404) {
      throw new Error(`GitHub user "${cleanUser}" not found.`);
    }
    if (res.status === 403) {
      throw new Error(`GitHub API rate limit exceeded or access forbidden. Configure GITHUB_TOKEN in .env for higher limits.`);
    }
    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    return res.json();
  }

  /**
   * Fetch ALL user's public repositories using pagination (up to 100 per page, up to 10 pages / 1,000 repos)
   */
  public async getAllUserRepos(username: string, maxPages: number = 10): Promise<GitHubRepoItem[]> {
    const cleanUser = GitHubClient.extractUsername(username);
    const allRepos: GitHubRepoItem[] = [];

    for (let page = 1; page <= maxPages; page++) {
      try {
        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100&page=${page}`,
          { headers: this.getHeaders() }
        );

        if (!res.ok) break;

        const repos: GitHubRepoItem[] = await res.json();
        if (!Array.isArray(repos) || repos.length === 0) break;

        allRepos.push(...repos);
        if (repos.length < 100) break; // Reached last page
      } catch {
        break;
      }
    }

    // Return ALL ingested repositories without dropping any
    return allRepos;
  }

  /**
   * Check repository for CI workflows (.github/workflows)
   */
  public async checkCIWorkflow(owner: string, repo: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/.github/workflows`,
        { headers: this.getHeaders() }
      );
      return res.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Check repository for README documentation
   */
  public async checkReadme(owner: string, repo: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`,
        { headers: this.getHeaders() }
      );
      return res.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Inspect package.json or root contents to detect test scripts or test directories
   */
  public async checkTestIndicators(owner: string, repo: string): Promise<{ hasTests: boolean; evidence: string | null }> {
    try {
      // Check package.json if present
      const pkgRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/package.json`,
        { headers: this.getHeaders() }
      );
      if (pkgRes.status === 200) {
        const pkgData = await pkgRes.json();
        if (pkgData.content) {
          const content = Buffer.from(pkgData.content, "base64").toString("utf-8");
          if (/jest|vitest|mocha|cypress|playwright|pytest|rspec|"test":/i.test(content)) {
            return { hasTests: true, evidence: "Automated test script/framework detected" };
          }
        }
      }

      // Check root directory for tests or __tests__ or test files
      const rootRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`,
        { headers: this.getHeaders() }
      );
      if (rootRes.status === 200) {
        const items: Array<{ name: string; type: string }> = await rootRes.json();
        const testFolder = items.find((i) => /^(test|tests|__tests__|spec|testing)$/i.test(i.name));
        if (testFolder) {
          return { hasTests: true, evidence: `Dedicated test directory "${testFolder.name}/"` };
        }
        const testFile = items.find((i) => /\.(test|spec)\.(ts|js|jsx|tsx|py|go|rs)$/i.test(i.name));
        if (testFile) {
          return { hasTests: true, evidence: `Test file "${testFile.name}" in root` };
        }
      }
    } catch {
      // safe fallback on rate limits
    }

    return { hasTests: false, evidence: null };
  }

  /**
   * Full profile and repository evidence analysis across ALL public repositories
   */
  public async analyzeProfile(username: string): Promise<GitHubProfileAnalysisResult> {
    const user = await this.getUser(username);
    // Fetch ALL public repositories
    const repos = await this.getAllUserRepos(user.login);

    const languageCounts: Record<string, number> = {};
    const analyzedRepos: GitHubRepoAnalysis[] = [];
    let testedCount = 0;
    let ciCount = 0;
    let docsCount = 0;

    // Determine deep inspection budget based on token presence
    const hasAuthToken = Boolean(this.token && this.token.trim().length > 0);
    // If authenticated: deep inspect up to 80 repos; if unauthenticated: deep inspect top 15 to stay within 60 req/hr, and use metadata heuristics for the rest
    const deepInspectBudget = hasAuthToken ? 80 : 15;

    // Sort to prioritize top starred or recent repos for deep inspection
    const prioritizedRepos = [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

    // Inspect repositories in parallel batches of 5 to maintain high performance
    const BATCH_SIZE = 5;
    for (let i = 0; i < prioritizedRepos.length; i += BATCH_SIZE) {
      const batch = prioritizedRepos.slice(i, i + BATCH_SIZE);
      const shouldDeepInspect = i < deepInspectBudget;

      const batchResults = await Promise.all(
        batch.map(async (repo) => {
          if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
          }

          let hasCI = false;
          let hasDocs = false;
          let testCheck: { hasTests: boolean; evidence: string | null } = { hasTests: false, evidence: null };

          if (shouldDeepInspect) {
            try {
              const [ci, docs, tests] = await Promise.all([
                this.checkCIWorkflow(user.login, repo.name),
                this.checkReadme(user.login, repo.name),
                this.checkTestIndicators(user.login, repo.name),
              ]);
              hasCI = ci;
              hasDocs = docs;
              testCheck = tests;
            } catch {
              // Gracefully handle rate limit fallback
            }
          }

          // Heuristic fallback from topics and metadata if deep inspection wasn't performed or returned false
          if (!hasCI && repo.topics) {
            hasCI = repo.topics.some((t) => /ci|github-actions|workflow|devops/i.test(t));
          }
          if (!testCheck.hasTests && repo.topics) {
            const testTopic = repo.topics.find((t) => /test|jest|vitest|pytest|testing|tdd/i.test(t));
            if (testTopic) {
              testCheck = { hasTests: true, evidence: `Topic tag: ${testTopic}` };
            }
          }
          if (!hasDocs && (repo.description || repo.homepage)) {
            hasDocs = true;
          }

          let complexity = 45; // baseline
          if (testCheck.hasTests) complexity += 20;
          if (hasCI) complexity += 20;
          if (hasDocs) complexity += 10;
          if (repo.stargazers_count > 5) complexity += 5;

          return {
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            primaryLanguage: repo.language,
            topics: repo.topics || [],
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            hasTests: testCheck.hasTests,
            hasCI,
            hasDocs,
            testEvidence: testCheck.evidence,
            ciEvidence: hasCI ? ".github/workflows active" : null,
            estimatedComplexity: Math.min(100, complexity),
          };
        })
      );

      for (const res of batchResults) {
        if (res.hasTests) testedCount += 1;
        if (res.hasCI) ciCount += 1;
        if (res.hasDocs) docsCount += 1;
        analyzedRepos.push(res);
      }
    }

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    return {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      location: user.location,
      blogUrl: user.blog,
      publicRepoCount: user.public_repos || analyzedRepos.length,
      topLanguages,
      analyzedRepos,
      engineeringPractices: {
        testedReposCount: testedCount,
        ciEnabledReposCount: ciCount,
        documentedReposCount: docsCount,
      },
    };
  }
}
