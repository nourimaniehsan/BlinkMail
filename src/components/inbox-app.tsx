"use client";

import DOMPurify from "dompurify";
import {
  AlertCircle,
  Check,
  Copy,
  Inbox,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMailbox, getEmails, getMailbox } from "@/lib/client-api";
import type { Email, Mailbox } from "@/types/mail";

const STORAGE_KEY = "blinkmail.currentMailboxToken";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function preview(email: Email) {
  return (email.textBody || email.htmlBody?.replace(/<[^>]*>/g, " ") || "No preview available.")
    .replace(/\s+/g, " ")
    .trim();
}

function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function EmptyInbox() {
  return (
    <div className="glass grid min-h-72 place-items-center rounded-2xl p-8 text-center">
      <div>
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl border border-blue-300/20 bg-blue-400/10 text-blue-200 shadow-glow">
          <Inbox className="h-10 w-10 animate-float" />
        </div>
        <h2 className="text-xl font-semibold text-white">Inbox is empty</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          Messages sent to this address will appear here automatically.
        </p>
      </div>
    </div>
  );
}

function EmailList({
  emails,
  selectedId,
  onSelect,
}: {
  emails: Email[];
  selectedId: string | null;
  onSelect: (email: Email) => void;
}) {
  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelect(email)}
          className={`glass w-full rounded-xl p-4 text-left transition hover:border-blue-300/40 ${
            selectedId === email.id ? "border-blue-300/50 bg-blue-500/10" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {email.fromName || email.fromAddress}
              </p>
              <p className="mt-1 truncate text-base font-semibold text-slate-100">{email.subject}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-500">{formatDate(email.receivedAt)}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{preview(email)}</p>
          {email.detectedOtp ? (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Code {email.detectedOtp}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function EmailViewer({ email }: { email: Email | null }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const sanitizedHtml = useMemo(() => {
    if (!email?.htmlBody || typeof window === "undefined") return null;
    return DOMPurify.sanitize(email.htmlBody, {
      USE_PROFILES: { html: true },
    });
  }, [email]);

  if (!email) {
    return (
      <div className="glass hidden min-h-[28rem] place-items-center rounded-2xl p-8 text-center lg:grid">
        <div className="max-w-sm">
          <Mail className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 text-sm text-slate-400">Select an email to open it.</p>
        </div>
      </div>
    );
  }

  const copyCode = async () => {
    if (!email.detectedOtp) return;
    await navigator.clipboard.writeText(email.detectedOtp);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <article className="glass rounded-2xl p-5 sm:p-6">
      <div className="border-b border-white/10 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
          {formatDate(email.receivedAt)}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">{email.subject}</h2>
        <div className="mt-4 grid gap-1 text-sm text-slate-400">
          <p>
            From <span className="text-slate-100">{email.fromName || email.fromAddress}</span>
          </p>
          <p>
            To <span className="text-slate-100">{email.toAddress}</span>
          </p>
        </div>
      </div>

      {email.detectedOtp ? (
        <div className="my-5 flex flex-col gap-3 rounded-xl border border-blue-300/20 bg-blue-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Detected Code</p>
            <p className="mt-1 font-mono text-3xl font-bold text-white">{email.detectedOtp}</p>
          </div>
          <Button onClick={copyCode} className="bg-blue-500/30">
            {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy Code
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        {sanitizedHtml ? (
          <div className="mail-html rounded-xl border border-white/10 bg-black/20 p-4" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        ) : (
          <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-200">
            {email.textBody || "No message body was provided."}
          </pre>
        )}
      </div>

      {email.attachments.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-white">Attachments</p>
          <div className="grid gap-2">
            {email.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                {attachment.filename}
                {attachment.size ? <span className="text-slate-500"> · {attachment.size} bytes</span> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function InboxApp({ initialToken }: { initialToken?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(initialToken ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mailboxQuery = useQuery({
    queryKey: ["mailbox", token],
    queryFn: () => getMailbox(token),
    enabled: Boolean(token),
  });

  const emailQuery = useQuery({
    queryKey: ["emails", token],
    queryFn: () => getEmails(token),
    enabled: Boolean(token),
    refetchInterval: 8_000,
  });

  const {
    mutate: createMailboxNow,
    isPending: isCreatingMailbox,
    error: createMailboxError,
  } = useMutation({
    mutationFn: createMailbox,
    onSuccess: ({ mailbox }) => {
      localStorage.setItem(STORAGE_KEY, mailbox.token);
      setToken(mailbox.token);
      setSelectedId(null);
      queryClient.setQueryData(["mailbox", mailbox.token], { mailbox });
      router.replace(`/inbox/${mailbox.token}`);
    },
  });

  useEffect(() => {
    if (initialToken) {
      localStorage.setItem(STORAGE_KEY, initialToken);
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setToken(stored);
      router.replace(`/inbox/${stored}`);
    } else {
      createMailboxNow();
    }
  }, [initialToken, router, createMailboxNow]);

  const mailbox: Mailbox | undefined = mailboxQuery.data?.mailbox;
  const emails = useMemo(() => emailQuery.data?.emails ?? [], [emailQuery.data?.emails]);
  const selectedEmail = emails.find((email) => email.id === selectedId) ?? emails[0] ?? null;

  useEffect(() => {
    if (!selectedId && emails[0]) {
      setSelectedId(emails[0].id);
    }
  }, [emails, selectedId]);

  const copyAddress = async () => {
    if (!mailbox?.address) return;
    await navigator.clipboard.writeText(mailbox.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const newMailbox = () => {
    createMailboxNow();
  };

  const isBooting = isCreatingMailbox && !mailbox;
  const error = mailboxQuery.error || emailQuery.error || createMailboxError;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
      <section className="pt-5 sm:pt-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          Anonymous inbox on spike.green
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-black tracking-normal text-white sm:text-6xl">
              BlinkMail
            </h1>
            <div className="mt-5 glass rounded-2xl p-4 sm:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Current Address
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all font-mono text-2xl font-bold text-white sm:text-3xl">
                  {isBooting ? "generating..." : mailbox?.address || "unavailable"}
                </p>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={copyAddress} disabled={!mailbox}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </Button>
                  <Button onClick={() => emailQuery.refetch()} disabled={!token || emailQuery.isFetching}>
                    <RefreshCw className={`h-4 w-4 ${emailQuery.isFetching ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={newMailbox}
            disabled={isCreatingMailbox}
            className="h-12 bg-gradient-to-r from-blue-500 to-violet-500 text-base shadow-glow"
          >
            {isCreatingMailbox ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            New Mailbox
          </Button>
        </div>
      </section>

      {error ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error instanceof Error ? error.message : "Something went wrong."}</span>
        </div>
      ) : null}

      <section className="mt-8 grid gap-5 lg:grid-cols-[24rem_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Inbox</h2>
            {emailQuery.isFetching ? (
              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing
              </span>
            ) : null}
          </div>
          {emails.length > 0 ? (
            <EmailList
              emails={emails}
              selectedId={selectedEmail?.id ?? null}
              onSelect={(email) => setSelectedId(email.id)}
            />
          ) : (
            <EmptyInbox />
          )}
        </div>
        <EmailViewer email={selectedEmail} />
      </section>

      <footer className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
        <Link className="hover:text-white" href="/privacy">
          Privacy
        </Link>
        <span className="px-2">/</span>
        <Link className="hover:text-white" href="/terms">
          Terms
        </Link>
        <span className="px-2">/</span>
        <Link className="hover:text-white" href="/abuse">
          Abuse
        </Link>
      </footer>
    </main>
  );
}
