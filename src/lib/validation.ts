import { z } from "zod";

export const submitSchema = z.object({
  repoUrl: z
    .string()
    .trim()
    .min(10)
    .max(200)
    // Only allow canonical github.com URLs — no arbitrary hosts (SSRF guard).
    .regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]{1,39}\/[A-Za-z0-9_.-]{1,100}\/?$/, "invalid-github-url"),
  note: z.string().trim().max(500).optional().default(""),
});

export type SubmitInput = z.infer<typeof submitSchema>;

export function parseRepoUrl(url: string): { owner: string; repo: string; fullName: string } | null {
  const match = url.trim().match(/^https:\/\/github\.com\/([A-Za-z0-9_.-]{1,39})\/([A-Za-z0-9_.-]{1,100})\/?$/);
  if (!match) return null;
  const repo = match[2].replace(/\.git$/, "");
  return { owner: match[1], repo, fullName: `${match[1]}/${repo}` };
}

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
});

export const curationSchema = z.object({
  slug: z.string().min(1).max(120),
  category: z.string().max(40).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  docScore: z.number().int().min(0).max(100).optional(),
  demoScore: z.number().int().min(0).max(100).optional(),
  beginnerFriendly: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const syncSchema = z.object({
  trigger: z.enum(["manual", "cron"]).default("manual"),
  limit: z.number().int().min(1).max(60).default(30),
});
