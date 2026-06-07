import { z } from "zod";
import { genericWebhookSchema, type GenericWebhookInput } from "@/lib/schemas";

type AttachmentInput = {
  filename: string;
  contentType?: string | null;
  size?: number | null;
  url?: string | null;
};

export type NormalizedIncomingEmail = {
  recipient: string;
  fromAddress: string;
  fromName?: string | null;
  subject: string;
  textBody?: string | null;
  htmlBody?: string | null;
  messageId?: string | null;
  receivedAt?: Date;
  attachments: AttachmentInput[];
  rawPayload: unknown;
};

const attachmentSchema = z
  .object({
    filename: z.string().optional(),
    name: z.string().optional(),
    contentType: z.string().optional(),
    content_type: z.string().optional(),
    type: z.string().optional(),
    size: z.coerce.number().optional(),
    url: z.string().url().optional(),
  })
  .passthrough();

function getAddress(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    return value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase();
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const address = getAddress(item);
      if (address) return address;
    }
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return getAddress(record.address ?? record.email ?? record.value ?? record.text);
  }
  return undefined;
}

function getName(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return typeof record.name === "string" ? record.name : null;
}

function normalizeAttachments(value: unknown): AttachmentInput[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];

  return items
    .map((item) => attachmentSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => {
      const data = result.data;
      return {
        filename: data.filename ?? data.name ?? "attachment",
        contentType: data.contentType ?? data.content_type ?? data.type ?? null,
        size: data.size ?? null,
        url: data.url ?? null,
      };
    });
}

function parseReceivedAt(value: GenericWebhookInput["timestamp"]) {
  if (!value) return undefined;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const milliseconds = numeric < 10_000_000_000 ? numeric * 1000 : numeric;
    return new Date(milliseconds);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function normalizeIncomingEmail(input: unknown): NormalizedIncomingEmail {
  const parsed = genericWebhookSchema.parse(input);
  const recipient = getAddress(parsed.recipient ?? parsed.to);
  const fromAddress = getAddress(parsed.fromAddress ?? parsed.sender ?? parsed.from);

  if (!recipient) {
    throw new Error("Webhook payload does not include a recipient email address.");
  }

  if (!fromAddress) {
    throw new Error("Webhook payload does not include a sender email address.");
  }

  return {
    recipient,
    fromAddress,
    fromName: parsed.fromName ?? getName(parsed.from),
    subject: parsed.subject?.slice(0, 500) || "(no subject)",
    textBody: parsed.textBody ?? parsed.text ?? parsed["body-plain"] ?? null,
    htmlBody: parsed.htmlBody ?? parsed.html ?? parsed["body-html"] ?? null,
    messageId: parsed.messageId ?? parsed["Message-Id"] ?? null,
    receivedAt: parseReceivedAt(parsed.timestamp),
    attachments: normalizeAttachments(parsed.attachments),
    rawPayload: input,
  };
}

export async function requestToWebhookPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData();
    const payload: Record<string, unknown> = {};
    const attachments = [];

    for (const [key, value] of form.entries()) {
      if (typeof File !== "undefined" && value instanceof File) {
        attachments.push({
          filename: value.name,
          contentType: value.type || null,
          size: value.size,
        });
      } else if (key.startsWith("attachment")) {
        attachments.push({ filename: String(value) });
      } else if (payload[key]) {
        payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
      } else {
        payload[key] = value;
      }
    }

    if (attachments.length > 0) {
      payload.attachments = attachments;
    }

    return payload;
  }

  throw new Error("Unsupported webhook content type.");
}
