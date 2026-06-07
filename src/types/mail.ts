export type Mailbox = {
  id: string;
  token: string;
  address: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
};

export type Attachment = {
  id: string;
  emailId: string;
  filename: string;
  contentType: string | null;
  size: number | null;
  url: string | null;
  createdAt: string;
};

export type Email = {
  id: string;
  mailboxId: string;
  messageId: string | null;
  fromAddress: string;
  fromName: string | null;
  toAddress: string;
  subject: string;
  textBody: string | null;
  htmlBody: string | null;
  detectedOtp: string | null;
  rawPayload: unknown;
  receivedAt: string;
  createdAt: string;
  attachments: Attachment[];
};

