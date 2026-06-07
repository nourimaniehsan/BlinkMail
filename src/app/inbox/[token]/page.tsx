import { InboxApp } from "@/components/inbox-app";

type InboxPageProps = {
  params: Promise<{ token: string }>;
};

export default async function InboxPage({ params }: InboxPageProps) {
  const { token } = await params;
  return <InboxApp initialToken={token} />;
}
