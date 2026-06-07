import { NextRequest } from "next/server";
import { apiError, json } from "@/lib/http";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { abuseReportSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, {
    action: "abuse_report",
    limit: 5,
    windowSeconds: 3600,
  });

  if (!limited.allowed) {
    return apiError("Too many abuse reports from this network.", 429, {
      retryAfter: limited.retryAfter,
    });
  }

  const body = await request.json().catch(() => null);
  const parsed = abuseReportSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("Invalid abuse report.", 400, parsed.error.flatten());
  }

  await prisma.abuseReport.create({
    data: {
      email: parsed.data.email || null,
      mailbox: parsed.data.mailbox || null,
      message: parsed.data.message,
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    },
  });

  return json({ accepted: true }, { status: 201 });
}
