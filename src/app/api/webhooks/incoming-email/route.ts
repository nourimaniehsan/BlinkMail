import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { apiError, json } from "@/lib/http";
import { normalizeIncomingEmail, requestToWebhookPayload } from "@/lib/email-normalizer";
import { env, mailDomain } from "@/lib/env";
import { detectOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

function hasValidSecret(request: NextRequest) {
  const expected = env.INCOMING_WEBHOOK_SECRET;

  if (!expected && env.NODE_ENV !== "production") {
    return true;
  }

  const auth = request.headers.get("authorization");
  const headerSecret =
    request.headers.get("x-blinkmail-secret") ||
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-forwardemail-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const bearerSecret = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;

  return [headerSecret, querySecret, bearerSecret].some((value) => value && value === expected);
}

export async function POST(request: NextRequest) {
  if (!hasValidSecret(request)) {
    return apiError("Invalid webhook secret.", 401);
  }

  const limited = await rateLimit(request, {
    action: "incoming_email",
    limit: 300,
    windowSeconds: 60,
  });

  if (!limited.allowed) {
    return apiError("Webhook rate limit exceeded.", 429, {
      retryAfter: limited.retryAfter,
    });
  }

  let incoming;

  try {
    const payload = await requestToWebhookPayload(request);
    incoming = normalizeIncomingEmail(payload);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Invalid webhook payload.", 400);
  }

  if (!incoming.recipient.endsWith(`@${mailDomain}`)) {
    return apiError("Recipient domain is not managed by BlinkMail.", 422);
  }

  const mailbox = await prisma.mailbox.findUnique({
    where: { address: incoming.recipient },
    select: { id: true },
  });

  if (!mailbox) {
    return apiError("Recipient mailbox was not found.", 404);
  }

  const email = await prisma.email.create({
    data: {
      mailboxId: mailbox.id,
      messageId: incoming.messageId,
      fromAddress: incoming.fromAddress,
      fromName: incoming.fromName,
      toAddress: incoming.recipient,
      subject: incoming.subject,
      textBody: incoming.textBody,
      htmlBody: incoming.htmlBody,
      detectedOtp: detectOtp(incoming.subject, incoming.textBody, incoming.htmlBody),
      rawPayload: incoming.rawPayload as Prisma.InputJsonValue,
      receivedAt: incoming.receivedAt ?? new Date(),
      attachments: {
        create: incoming.attachments,
      },
    },
    include: {
      attachments: true,
    },
  });

  return json({ accepted: true, emailId: email.id }, { status: 202 });
}
