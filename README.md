# BlinkMail

BlinkMail is an instant anonymous inbox service for `spike.green`. A visitor gets a permanent mailbox immediately, can copy the generated address, refresh the inbox manually, or receive new messages through 8-second polling.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- React Query
- Lucide Icons

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
```

Edit `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/blinkmail?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MAIL_DOMAIN="spike.green"
INCOMING_WEBHOOK_SECRET="use-a-long-random-secret"
NODE_ENV="development"
```

## Database Setup

Create a PostgreSQL database, then run:

```bash
npm run prisma:migrate
npm run seed
```

The seed creates:

```text
cloud-x82m@spike.green
```

Open:

```text
http://localhost:3000/inbox/demo-cloud-x82m
```

## Local Development

```bash
npm run dev
```

Health check:

```text
GET http://localhost:3000/api/health
```

Create a mailbox:

```bash
curl -X POST http://localhost:3000/api/mailboxes
```

Send a sample generic webhook:

```bash
curl -X POST "http://localhost:3000/api/webhooks/incoming-email?secret=use-a-long-random-secret" \
  -H "Content-Type: application/json" \
  --data @sample-webhooks/generic.json
```

## API

```text
POST /api/mailboxes
GET /api/mailboxes/[token]
GET /api/mailboxes/[token]/emails
POST /api/webhooks/incoming-email
GET /api/health
POST /api/abuse
```

Webhook authentication accepts one of:

```text
Authorization: Bearer INCOMING_WEBHOOK_SECRET
x-blinkmail-secret: INCOMING_WEBHOOK_SECRET
x-webhook-secret: INCOMING_WEBHOOK_SECRET
x-forwardemail-secret: INCOMING_WEBHOOK_SECRET
?secret=INCOMING_WEBHOOK_SECRET
```

## Mailgun Setup

1. Add and verify `spike.green` in Mailgun.
2. Configure DNS records shown in the Mailgun domain screen.
3. Create an inbound route:

```text
Expression Type: Match Recipient
Recipient: .*@spike.green
Action: Forward
Destination URL: https://YOUR_APP.vercel.app/api/webhooks/incoming-email?secret=INCOMING_WEBHOOK_SECRET
Priority: 1
```

BlinkMail reads Mailgun fields such as `recipient`, `sender`, `from`, `subject`, `body-plain`, `body-html`, `Message-Id`, `timestamp`, and attachment form fields.

## ForwardEmail Setup

1. Add `spike.green` to ForwardEmail.
2. Set the webhook endpoint:

```text
https://YOUR_APP.vercel.app/api/webhooks/incoming-email
```

3. Add a secret header:

```text
x-forwardemail-secret: INCOMING_WEBHOOK_SECRET
```

BlinkMail reads ForwardEmail fields such as `to`, `from`, `subject`, `text`, `html`, `messageId`, and `attachments`.

## Generic JSON Webhook

Send JSON in this shape:

```json
{
  "recipient": "fox-7k92@spike.green",
  "fromAddress": "noreply@example.com",
  "fromName": "Example App",
  "subject": "Your code is 123456",
  "textBody": "Your code is 123456",
  "htmlBody": "<p>Your code is <strong>123456</strong></p>",
  "messageId": "example-001",
  "attachments": [
    {
      "filename": "receipt.pdf",
      "contentType": "application/pdf",
      "size": 2048,
      "url": "https://example.com/receipt.pdf"
    }
  ]
}
```

## Vercel Deployment

1. Create a Vercel project from this repository.
2. Attach a PostgreSQL database, such as Vercel Postgres, Neon, Supabase, or Railway.
3. Add environment variables:

```text
DATABASE_URL
NEXT_PUBLIC_APP_URL=https://YOUR_APP.vercel.app
NEXT_PUBLIC_MAIL_DOMAIN=spike.green
INCOMING_WEBHOOK_SECRET
NODE_ENV=production
```

4. Set the build command:

```bash
npm run prisma:generate && npm run build
```

5. Run migrations before or during deployment:

```bash
npm run prisma:deploy
```

For Vercel, run `npm run prisma:deploy` from a deployment job, local terminal with production `DATABASE_URL`, or a protected CI step.

## Domain Configuration

Add `spike.green` to Vercel and point the website to the deployment. Use one of these Vercel DNS patterns:

```text
Name: @
Type: A
Value: 76.76.21.21
Purpose: apex website
```

```text
Name: www
Type: CNAME
Value: cname.vercel-dns.com
Purpose: www website
```

Exact inbound mail DNS records depend on the mail provider. Configure only one inbound provider for MX records.

## Exact DNS Records for spike.green

Website:

```text
@      A      76.76.21.21
www    CNAME  cname.vercel-dns.com
```

Mailgun inbound example:

```text
@      MX     10 mxa.mailgun.org
@      MX     10 mxb.mailgun.org
mg     TXT    v=spf1 include:mailgun.org ~all
```

Mailgun will also provide DKIM TXT and optional tracking CNAME records. Add those exact values from Mailgun because they are account-specific.

ForwardEmail inbound example:

```text
@      MX     10 mx1.forwardemail.net
@      MX     10 mx2.forwardemail.net
@      TXT    v=spf1 include:spf.forwardemail.net ~all
```

ForwardEmail may provide DKIM, DMARC, and verification TXT records. Add the exact values from ForwardEmail because they are account-specific.

Recommended DMARC:

```text
_dmarc TXT    v=DMARC1; p=quarantine; rua=mailto:abuse@spike.green; fo=1
```

## Deployment Checklist

- PostgreSQL database is created and reachable.
- `DATABASE_URL` is set in Vercel.
- `NEXT_PUBLIC_APP_URL` matches the deployed HTTPS URL.
- `NEXT_PUBLIC_MAIL_DOMAIN=spike.green`.
- `INCOMING_WEBHOOK_SECRET` is long, random, and configured in the email provider.
- Prisma Client generation runs during build.
- Prisma migrations are deployed to production.
- `spike.green` is attached to Vercel.
- Website DNS records point to Vercel.
- Exactly one inbound provider owns the MX records for `spike.green`.
- The inbound provider forwards all `*@spike.green` mail to `/api/webhooks/incoming-email`.
- `/api/health` returns `status: ok`.
- A generated mailbox receives a real test email.
