import { NextRequest } from "next/server";
import { apiError, json } from "@/lib/http";
import { mailboxSelect } from "@/lib/mailbox";
import { prisma } from "@/lib/prisma";
import { tokenSchema } from "@/lib/schemas";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  const parsed = tokenSchema.safeParse(token);

  if (!parsed.success) {
    return apiError("Invalid mailbox token.", 400, parsed.error.flatten());
  }

  const mailbox = await prisma.mailbox.findUnique({
    where: { token: parsed.data },
    select: mailboxSelect,
  });

  if (!mailbox) {
    return apiError("Mailbox not found.", 404);
  }

  return json({ mailbox });
}

