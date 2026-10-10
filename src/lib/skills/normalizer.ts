import { SKILL_TAXONOMY, type CanonicalSkill } from "./taxonomy";

export interface NormalizedSkillResult {
  canonicalName: string;
  category: string;
  isRecognized: boolean;
  matchType: "exact" | "alias" | "fallback";
  originalInput: string;
}

export function normalizeSkill(input: string): NormalizedSkillResult {
  if (!input || typeof input !== "string") {
    return {
      canonicalName: "Unknown",
      category: "Tools",
      isRecognized: false,
      matchType: "fallback",
      originalInput: "",
    };
  }

  const cleaned = input.trim();
  const lower = cleaned.toLowerCase();

  // 1. Direct canonical name match (case-insensitive)
  const directMatch = SKILL_TAXONOMY.find(
    (s) => s.name.toLowerCase() === lower
  );
  if (directMatch) {
    return {
      canonicalName: directMatch.name,
      category: directMatch.category,
      isRecognized: true,
      matchType: "exact",
      originalInput: cleaned,
    };
  }

  // 2. Alias match
  const aliasMatch = SKILL_TAXONOMY.find((s) =>
    s.aliases.some((alias) => alias.toLowerCase() === lower)
  );
  if (aliasMatch) {
    return {
      canonicalName: aliasMatch.name,
      category: aliasMatch.category,
      isRecognized: true,
      matchType: "alias",
      originalInput: cleaned,
    };
  }

  // 3. Fallback: normalize casing nicely (e.g. capitalize words or keep uppercase acronyms)
  let formatted = cleaned;
  if (cleaned.length <= 4) {
    formatted = cleaned.toUpperCase();
  } else {
    formatted = cleaned
      .split(/[\s_-]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  return {
    canonicalName: formatted,
    category: "Tools",
    isRecognized: false,
    matchType: "fallback",
    originalInput: cleaned,
  };
}

/**
 * Check if two skills are semantically related (transferable) according to taxonomy
 */
export function areSkillsRelated(skillA: string, skillB: string): boolean {
  const normA = normalizeSkill(skillA).canonicalName.toLowerCase();
  const normB = normalizeSkill(skillB).canonicalName.toLowerCase();

  if (normA === normB) return true;

  const itemA = SKILL_TAXONOMY.find((s) => s.name.toLowerCase() === normA);
  if (itemA?.relatedSkills?.some((rel) => rel.toLowerCase() === normB)) {
    return true;
  }

  const itemB = SKILL_TAXONOMY.find((s) => s.name.toLowerCase() === normB);
  if (itemB?.relatedSkills?.some((rel) => rel.toLowerCase() === normA)) {
    return true;
  }

  return false;
}

/**
 * Batch normalize array of skills, de-duplicating canonical names
 */
export function normalizeSkillList(skills: string[]): NormalizedSkillResult[] {
  const seen = new Set<string>();
  const results: NormalizedSkillResult[] = [];

  for (const s of skills) {
    const res = normalizeSkill(s);
    if (!seen.has(res.canonicalName.toLowerCase())) {
      seen.add(res.canonicalName.toLowerCase());
      results.push(res);
    }
  }

  return results;
}
