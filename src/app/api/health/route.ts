import { json } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "error" = "ok";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  return json({
    status: database === "ok" ? "ok" : "degraded",
    database,
    latencyMs: Date.now() - startedAt,
    service: "BlinkMail",
  });
}

