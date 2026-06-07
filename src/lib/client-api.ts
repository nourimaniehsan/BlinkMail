import type { Email, Mailbox } from "@/types/mail";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Request failed.");
  }

  return data;
}

export function createMailbox() {
  return requestJson<{ mailbox: Mailbox }>("/api/mailboxes", {
    method: "POST",
  });
}

export function getMailbox(token: string) {
  return requestJson<{ mailbox: Mailbox }>(`/api/mailboxes/${encodeURIComponent(token)}`);
}

export function getEmails(token: string) {
  return requestJson<{ emails: Email[] }>(`/api/mailboxes/${encodeURIComponent(token)}/emails`);
}

export function submitAbuseReport(body: { email?: string; mailbox?: string; message: string }) {
  return requestJson<{ accepted: true }>("/api/abuse", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

