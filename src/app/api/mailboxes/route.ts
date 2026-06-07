import { NextRequest } from "next/server";
import { createMailbox } from "@/lib/mailbox";
import { apiError, json } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, {
    action: "create_mailbox",
    limit: 30,
    windowSeconds: 60,
  });

  if (!limited.allowed) {
    return apiError("Too many mailbox requests. Please try again shortly.", 429, {
      retryAfter: limited.retryAfter,
    });
  }

  const mailbox = await createMailbox();

  return json({ mailbox }, { status: 201 });
}

