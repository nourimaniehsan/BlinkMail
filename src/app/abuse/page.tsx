import { AbuseForm } from "@/components/abuse-form";

export default function AbusePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-14 pt-8 sm:px-6">
      <h1 className="text-4xl font-black text-white">Abuse</h1>
      <p className="mt-4 text-sm leading-7 text-slate-400">
        Report spam, phishing, malware, harassment, or illegal use involving a BlinkMail address.
      </p>
      <AbuseForm />
    </main>
  );
}
