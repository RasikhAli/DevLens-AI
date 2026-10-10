import { z } from "zod";

export const ParsedResumeSchema = z.object({
  name: z.string().min(1).default("Candidate"),
  headline: z.string().optional().default("Software Engineer"),
  summary: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  skills: z.array(z.string()).default([]),
  experiences: z.array(
    z.object({
      employer: z.string(),
      title: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isCurrent: z.boolean().default(false),
      description: z.string().default(""),
      technologies: z.array(z.string()).default([]),
    })
  ).default([]),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string().default(""),
      technologies: z.array(z.string()).default([]),
      repositoryUrl: z.string().optional(),
      liveUrl: z.string().optional(),
    })
  ).default([]),
  educations: z.array(
    z.object({
      institution: z.string(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      year: z.string().optional(),
    })
  ).default([]),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().default(""),
    })
  ).default([]),
});

export type ParsedResumeProfile = z.infer<typeof ParsedResumeSchema>;

export const ParsedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  requiredExperienceYears: z.number().optional().default(3),
  domainRequirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
});

export type ParsedJobRequirements = z.infer<typeof ParsedJobSchema>;

export interface MatchAdviceParams {
  developerName: string;
  jobTitle: string;
  totalScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
}

export interface MatchReportAdvice {
  summary: string;
  recommendedActions: string[];
  suggestedPortfolioProjects: string[];
  learningRecommendations: string[];
}

export interface AIProvider {
  name: string;
  parseResume(text: string): Promise<ParsedResumeProfile>;
  parseJob(text: string): Promise<ParsedJobRequirements>;
  generateMatchAdvice(params: MatchAdviceParams): Promise<MatchReportAdvice>;
}
