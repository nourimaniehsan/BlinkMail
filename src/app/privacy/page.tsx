export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-14 pt-8 sm:px-6">
      <h1 className="text-4xl font-black text-white">Privacy</h1>
      <div className="glass mt-8 space-y-6 rounded-2xl p-5 text-sm leading-7 text-slate-300 sm:p-7">
        <p>
          BlinkMail creates anonymous inboxes without requiring accounts. Mailboxes are permanent by default and are
          remembered in the browser using localStorage.
        </p>
        <p>
          We store mailbox addresses, received message metadata, message bodies, attachment metadata, abuse reports, and
          rate-limit events needed to operate and protect the service.
        </p>
        <p>
          Incoming messages are processed through configured inbound email providers such as Mailgun, ForwardEmail, or a
          compatible JSON webhook. HTML messages are sanitized before being displayed.
        </p>
        <p>
          Do not use BlinkMail for sensitive, regulated, or long-term communications. Anyone with a mailbox URL can view
          that mailbox.
        </p>
      </div>
    </main>
  );
}

