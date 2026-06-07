import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  action: string;
  limit: number;
  windowSeconds: number;
};

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function rateLimit(request: NextRequest, options: RateLimitOptions) {
  const ipAddress = getClientIp(request);
  const key = `${options.action}:${ipAddress}`;
  const since = new Date(Date.now() - options.windowSeconds * 1000);

  const count = await prisma.rateLimitEvent.count({
    where: {
      key,
      action: options.action,
      createdAt: { gte: since },
    },
  });

  if (count >= options.limit) {
    return {
      allowed: false,
      ipAddress,
      retryAfter: options.windowSeconds,
    };
  }

  await prisma.rateLimitEvent.create({
    data: {
      key,
      action: options.action,
      ipAddress,
    },
  });

  return {
    allowed: true,
    ipAddress,
    retryAfter: 0,
  };
}

