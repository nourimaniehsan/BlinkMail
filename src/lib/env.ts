import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_MAIL_DOMAIN: z.string().min(1).default("spike.green"),
  INCOMING_WEBHOOK_SECRET: z.string().min(16).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_MAIL_DOMAIN: process.env.NEXT_PUBLIC_MAIL_DOMAIN ?? "spike.green",
  INCOMING_WEBHOOK_SECRET: process.env.INCOMING_WEBHOOK_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});

export const mailDomain = env.NEXT_PUBLIC_MAIL_DOMAIN.toLowerCase();

