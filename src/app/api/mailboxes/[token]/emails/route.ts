import { NextRequest } from "next/server";
import { apiError, json } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { tokenSchema } from "@/lib/schemas";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  const parsed = tokenSchema.safeParse(token);

  if (!parsed.success) {
    return apiError("Invalid mailbox token.", 400, parsed.error.flatten());
  }

  const limited = await rateLimit(request, {
    action: "read_inbox",
    limit: 120,
    windowSeconds: 60,
  });

  if (!limited.allowed) {
    return apiError("Too many inbox refreshes. Please slow down.", 429, {
      retryAfter: limited.retryAfter,
    });
  }

  const mailbox = await prisma.mailbox.findUnique({
    where: { token: parsed.data },
    select: { id: true },
  });

  if (!mailbox) {
    return apiError("Mailbox not found.", 404);
  }

  const emails = await prisma.email.findMany({
    where: { mailboxId: mailbox.id },
    orderBy: { receivedAt: "desc" },
    include: {
      attachments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return json({ emails });
}

