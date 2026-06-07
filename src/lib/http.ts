import { NextResponse } from "next/server";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return json(
    {
      error: {
        message,
        details,
      },
    },
    { status },
  );
}

