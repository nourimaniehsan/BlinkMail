import { z } from "zod";

export const tokenSchema = z.string().regex(/^[a-z]+-[a-z0-9]{4,12}$/, "Invalid mailbox token.");

export const abuseReportSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  mailbox: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(20).max(4000),
});

export const genericWebhookSchema = z.object({
  recipient: z.string().email().optional(),
  to: z.unknown().optional(),
  sender: z.string().optional(),
  from: z.unknown().optional(),
  fromAddress: z.string().email().optional(),
  fromName: z.string().optional(),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  textBody: z.string().optional(),
  htmlBody: z.string().optional(),
  "body-plain": z.string().optional(),
  "body-html": z.string().optional(),
  messageId: z.string().optional(),
  "Message-Id": z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
  attachments: z.unknown().optional(),
});

export type GenericWebhookInput = z.infer<typeof genericWebhookSchema>;

