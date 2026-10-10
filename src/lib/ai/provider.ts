import { type AIProvider } from "./types";
import { MockAIProvider } from "./mock-provider";
import { GeminiAIProvider } from "./gemini-provider";
import { env } from "../env";

export function getAIProvider(): AIProvider {
  if (env.AI_PROVIDER === "gemini" && env.AI_API_KEY) {
    return new GeminiAIProvider(env.AI_API_KEY, env.AI_MODEL);
  }

  // Default robust mock provider
  return new MockAIProvider();
}

export const aiProvider = getAIProvider();
