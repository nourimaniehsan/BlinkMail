"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { submitAbuseReport } from "@/lib/client-api";

export function AbuseForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await submitAbuseReport({
        email: String(formData.get("email") || ""),
        mailbox: String(formData.get("mailbox") || ""),
        message: String(formData.get("message") || ""),
      });
      event.currentTarget.reset();
      setState("sent");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit report.");
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass mt-8 grid gap-4 rounded-2xl p-5 sm:p-6">
      <label className="grid gap-2 text-sm font-medium text-slate-200">
        Contact email
        <input
          name="email"
          type="email"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-blue-300/60"
          placeholder="security@example.com"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-200">
        BlinkMail address or token
        <input
          name="mailbox"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-blue-300/60"
          placeholder="fox-7k92@spike.green"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-200">
        Report
        <textarea
          name="message"
          required
          minLength={20}
          rows={6}
          className="resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-white outline-none transition focus:border-blue-300/60"
          placeholder="Include URLs, message IDs, timestamps, and what happened."
        />
      </label>
      <button
        disabled={state === "sending"}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        Submit Report
      </button>
      {state === "sent" ? (
        <p className="inline-flex items-center gap-2 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          Report received.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="inline-flex items-center gap-2 text-sm text-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}
    </form>
  );
}

