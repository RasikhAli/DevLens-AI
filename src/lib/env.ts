import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters").default("devlens-ai-secure-random-secret-key-32charsmin"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AI_PROVIDER: z.enum(["mock", "gemini", "openai"]).default("mock"),
  AI_API_KEY: z.string().optional().default(""),
  AI_MODEL: z.string().optional().default("gemini-1.5-pro"),
  GITHUB_TOKEN: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    AUTH_SECRET: process.env.AUTH_SECRET,
    APP_URL: process.env.APP_URL,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorDetails = error.errors.map((e) => `  - ${e.path.join(".")}: ${e.message}`).join("\n");
    console.error(`❌ Invalid environment variables:\n${errorDetails}`);
  }
  // Safe default fallback for development and testing
  parsedEnv = {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    AUTH_SECRET: process.env.AUTH_SECRET || "devlens-ai-secure-random-secret-key-32charsmin",
    APP_URL: process.env.APP_URL || "http://localhost:3000",
    AI_PROVIDER: (process.env.AI_PROVIDER as any) || "mock",
    AI_API_KEY: process.env.AI_API_KEY || "",
    AI_MODEL: process.env.AI_MODEL || "gemini-1.5-pro",
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
  };
}

export const env = parsedEnv;
