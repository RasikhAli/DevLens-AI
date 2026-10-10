import {
  type AIProvider,
  type ParsedResumeProfile,
  type ParsedJobRequirements,
  type MatchAdviceParams,
  type MatchReportAdvice,
  ParsedResumeSchema,
  ParsedJobSchema,
} from "./types";
import { normalizeSkill } from "../skills/normalizer";
import { SKILL_TAXONOMY } from "../skills/taxonomy";

/**
 * Intelligent deterministic heuristic AI provider.
 * Extracts all projects, work experience, education, and skills from resume text
 * using robust regex sectioning, bullet parsing, and NLP pattern matching.
 */
export class MockAIProvider implements AIProvider {
  public name = "Deterministic Heuristic Provider (Dev Mode)";

  public async parseResume(text: string): Promise<ParsedResumeProfile> {
    const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // 1. Extract email, phone, and links
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const githubMatches = Array.from(text.matchAll(/https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)(?:\/([a-zA-Z0-9_.-]+))?/gi));
    const liveUrls = Array.from(text.matchAll(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s)"]*)?/gi)).map((m) => m[0]);

    const email = emailMatch ? emailMatch[0] : "";
    const phone = phoneMatch ? phoneMatch[0] : "";

    // 2. Extract Candidate Name (First prominent line or before contact details)
    let candidateName = "Software Engineer";
    if (rawLines.length > 0 && rawLines[0].length < 40 && !rawLines[0].includes("@") && !rawLines[0].includes("http")) {
      candidateName = rawLines[0];
    } else if (rawLines.length > 1 && rawLines[1].length < 40 && !rawLines[1].includes("@")) {
      candidateName = rawLines[1];
    }

    // 3. Extract all skills scanning against SKILL_TAXONOMY
    const detectedSkills = new Set<string>();
    for (const skill of SKILL_TAXONOMY) {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(text)) {
        detectedSkills.add(skill.name);
      }
      for (const alias of skill.aliases) {
        const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        if (aliasRegex.test(text)) {
          detectedSkills.add(skill.name);
        }
      }
    }
    const skillList = Array.from(detectedSkills);

    // 4. Extract ALL projects dynamically from text
    const projects: ParsedResumeProfile["projects"] = [];
    const projectSectionHeader = /(?:Projects|Key Projects|Notable Projects|Personal Projects|Open Source|Portfolio|Works)/i;
    let inProjectSection = false;
    let currentProj: { name: string; description: string; technologies: string[]; url?: string } | null = null;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (projectSectionHeader.test(line) && line.length < 40) {
        inProjectSection = true;
        continue;
      }
      if (inProjectSection && /(?:Experience|Employment|Work History|Education|Skills|Certifications|References)/i.test(line) && line.length < 35) {
        inProjectSection = false;
        if (currentProj) {
          projects.push(currentProj);
          currentProj = null;
        }
      }

      if (inProjectSection) {
        // Detect project header (bullet point, or title with colon/dash, or bold pattern)
        const isNewItem = /^[-*•]\s+([A-Za-z0-9\s_-]+)/.test(line) || /^[A-Z][A-Za-z0-9\s_-]{2,30}(?:\s*[:|–—-]\s*|\s*\()/.test(line);
        if (isNewItem) {
          if (currentProj) projects.push(currentProj);
          const cleanName = line.replace(/^[-*•]\s+/, "").split(/[:|–—\-()]/)[0].trim();
          const projTechs = skillList.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(line));
          currentProj = {
            name: cleanName || `Project ${projects.length + 1}`,
            description: line.replace(/^[-*•]\s+/, ""),
            technologies: projTechs.length > 0 ? projTechs : skillList.slice(0, 3),
          };
        } else if (currentProj) {
          currentProj.description += " " + line;
          const lineTechs = skillList.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(line));
          for (const t of lineTechs) {
            if (!currentProj.technologies.includes(t)) currentProj.technologies.push(t);
          }
        }
      }
    }
    if (currentProj) projects.push(currentProj);

    // Also extract projects from any mentioned GitHub repositories:
    for (const gm of githubMatches) {
      const repoName = gm[2];
      if (repoName && !projects.some((p) => p.name.toLowerCase() === repoName.toLowerCase())) {
        projects.push({
          name: repoName,
          description: `Repository at github.com/${gm[1]}/${repoName}`,
          technologies: skillList.slice(0, 3),
          repositoryUrl: `https://github.com/${gm[1]}/${repoName}`,
        });
      }
    }

    // If still no project found, generate foundational showcase projects based on detected skills
    if (projects.length === 0) {
      if (skillList.includes("TypeScript") || skillList.includes("React")) {
        projects.push({
          name: "Interactive Web Platform",
          description: "Full-stack application with real-time UI, responsive state management, and modern component architecture.",
          technologies: skillList.filter((s) => ["TypeScript", "React", "Next.js", "Tailwind CSS"].includes(s)),
        });
      }
      if (skillList.includes("Python") || skillList.includes("Node.js") || skillList.includes("Go")) {
        projects.push({
          name: "High-Throughput API Engine",
          description: "Distributed backend service with automated testing suites, containerization, and database query optimization.",
          technologies: skillList.filter((s) => ["Python", "FastAPI", "Node.js", "PostgreSQL", "Docker"].includes(s)),
        });
      }
    }

    // 5. Extract ALL Work Experience positions dynamically
    const experiences: ParsedResumeProfile["experiences"] = [];
    const expHeaders = /(?:Experience|Employment|Work History|Professional Background|Career History)/i;
    let inExpSection = false;
    let currentExp: ParsedResumeProfile["experiences"][0] | null = null;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (expHeaders.test(line) && line.length < 40) {
        inExpSection = true;
        continue;
      }
      if (inExpSection && /(?:Education|Projects|Certifications|Skills|Interests)/i.test(line) && line.length < 35) {
        inExpSection = false;
        if (currentExp) {
          experiences.push(currentExp);
          currentExp = null;
        }
      }

      if (inExpSection) {
        // Detect job title/company pattern (e.g. "Senior Engineer at XYZ" or "Company - Role" or dates like "2020 - Present")
        const dateMatch = line.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(20\d\d|19\d\d)\s*[-–—to\s]+\s*(Present|Current|20\d\d)/i);
        const hasTitleWord = /(?:Engineer|Developer|Architect|Lead|Manager|Consultant|Intern|Specialist|Designer)/i.test(line);

        if (dateMatch || hasTitleWord) {
          if (currentExp) experiences.push(currentExp);
          const parts = line.split(/[-–—|@,]/);
          const title = hasTitleWord ? line.match(/[A-Za-z\s]+(?:Engineer|Developer|Architect|Lead|Manager|Consultant|Specialist)/i)?.[0]?.trim() || line : "Software Engineer";
          const employer = parts.length > 1 ? parts[1].trim() : "Technology Group";
          const expTechs = skillList.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(line));

          currentExp = {
            employer,
            title,
            startDate: dateMatch ? dateMatch[1] : "2021",
            endDate: dateMatch ? dateMatch[2] : "Present",
            isCurrent: dateMatch ? /Present|Current/i.test(dateMatch[2]) : true,
            description: line,
            technologies: expTechs.length > 0 ? expTechs : skillList.slice(0, 4),
          };
        } else if (currentExp) {
          currentExp.description += " " + line;
          const lineTechs = skillList.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(line));
          for (const t of lineTechs) {
            if (!currentExp.technologies.includes(t)) currentExp.technologies.push(t);
          }
        }
      }
    }
    if (currentExp) experiences.push(currentExp);

    if (experiences.length === 0) {
      experiences.push({
        employer: "Leading Engineering Team",
        title: "Senior Software Engineer",
        startDate: "2021",
        endDate: "Present",
        isCurrent: true,
        description: "Architected and delivered mission-critical web applications and data services with automated tests.",
        technologies: skillList.slice(0, 5),
      });
    }

    // 6. Extract Education
    const educations: ParsedResumeProfile["educations"] = [];
    for (const line of rawLines) {
      if (/(?:Bachelor|Master|B\.S\.|M\.S\.|BSc|MSc|Ph\.D|Degree|University|College|Institute)/i.test(line)) {
        educations.push({
          institution: line.split(/[,–—]/)[0].trim(),
          degree: line.includes("Master") ? "Master of Science" : "Bachelor of Science",
          fieldOfStudy: line.includes("Computer") ? "Computer Science" : "Software Engineering",
          year: line.match(/\b(20\d\d|19\d\d)\b/)?.[0] || "2020",
        });
        if (educations.length >= 2) break;
      }
    }
    if (educations.length === 0) {
      educations.push({
        institution: "University of Technology",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        year: "2020",
      });
    }

    const parsed: ParsedResumeProfile = {
      name: candidateName,
      headline: `${skillList.slice(0, 2).join(" / ")} Software Engineer`,
      summary: `Experienced developer with demonstrated focus in ${skillList.slice(0, 4).join(", ")}.`,
      email,
      phone,
      location: "Remote / Hybrid",
      skills: skillList.length > 0 ? skillList : ["TypeScript", "React", "Node.js"],
      experiences,
      projects,
      educations,
      certifications: [],
    };

    return ParsedResumeSchema.parse(parsed);
  }

  public async parseJob(text: string): Promise<ParsedJobRequirements> {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const title = lines[0] && lines[0].length < 60 ? lines[0] : "Senior Software Engineer";

    const requiredSkills = new Set<string>();
    for (const skill of SKILL_TAXONOMY) {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(text)) {
        requiredSkills.add(skill.name);
      }
    }

    const expMatch = text.match(/(\d+)\+?\s*years/i);
    const requiredExperienceYears = expMatch ? parseInt(expMatch[1], 10) : 3;

    const parsed: ParsedJobRequirements = {
      title,
      company: "Hiring Organization",
      requiredSkills: Array.from(requiredSkills).slice(0, 6),
      preferredSkills: Array.from(requiredSkills).slice(6, 12),
      requiredExperienceYears,
      domainRequirements: ["Cloud Architecture", "Distributed Systems"],
      responsibilities: [
        "Design and maintain scalable server-side systems and client-side experiences.",
        "Implement automated tests and maintain continuous delivery pipelines.",
      ],
    };

    return ParsedJobSchema.parse(parsed);
  }

  public async generateMatchAdvice(params: MatchAdviceParams): Promise<MatchReportAdvice> {
    const recommendedActions: string[] = [];
    const suggestedPortfolioProjects: string[] = [];
    const learningRecommendations: string[] = [];

    if (params.missingSkills.length > 0) {
      const topMissing = params.missingSkills.slice(0, 3).join(", ");
      recommendedActions.push(
        `Provide verifiable evidence for ${topMissing} by linking repositories or updating your project case studies.`
      );
      suggestedPortfolioProjects.push(
        `Build a production-ready application showcasing ${topMissing} with automated CI testing and comprehensive documentation.`
      );
      learningRecommendations.push(
        `Deepen hands-on competency in ${topMissing} focusing on enterprise design patterns and testing.`
      );
    } else {
      recommendedActions.push(
        "Highlight your leadership in testing, continuous integration, and architectural decisions in technical interviews."
      );
    }

    return {
      summary: `Candidate achieves a match score of ${params.totalScore}/100 against ${params.jobTitle}. ${
        params.strengths[0] || "Demonstrates strong foundational alignment."
      }`,
      recommendedActions,
      suggestedPortfolioProjects,
      learningRecommendations,
    };
  }
}
