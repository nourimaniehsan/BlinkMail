import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mailbox = await prisma.mailbox.upsert({
    where: { token: "demo-cloud-x82m" },
    update: {},
    create: {
      token: "demo-cloud-x82m",
      address: "cloud-x82m@spike.green",
      domain: "spike.green",
    },
  });

  await prisma.email.upsert({
    where: { id: "seed-email-otp" },
    update: {},
    create: {
      id: "seed-email-otp",
      mailboxId: mailbox.id,
      messageId: "seed-otp-001",
      fromAddress: "security@example.com",
      fromName: "Example Security",
      toAddress: mailbox.address,
      subject: "Your verification code is 123456",
      textBody: "Use 123456 to finish signing in. This code expires soon.",
      htmlBody: "<p>Use <strong>123456</strong> to finish signing in.</p>",
      detectedOtp: "123456",
      rawPayload: { seed: true, provider: "generic" },
    },
  });

  await prisma.email.upsert({
    where: { id: "seed-email-welcome" },
    update: {},
    create: {
      id: "seed-email-welcome",
      mailboxId: mailbox.id,
      messageId: "seed-welcome-001",
      fromAddress: "hello@blinkmail.dev",
      fromName: "BlinkMail",
      toAddress: mailbox.address,
      subject: "Welcome to your instant inbox",
      textBody: "This seeded message demonstrates previews, timestamps, and full email viewing.",
      htmlBody: "<h2>Welcome</h2><p>This seeded message demonstrates previews and full email viewing.</p>",
      rawPayload: { seed: true, provider: "generic" },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

