import { randomBytes } from "crypto";
import { mailDomain } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const WORDS = [
  "apex",
  "atlas",
  "blue",
  "bolt",
  "cloud",
  "comet",
  "ember",
  "falcon",
  "field",
  "flare",
  "flow",
  "fox",
  "glow",
  "halo",
  "ivy",
  "jade",
  "lumen",
  "mint",
  "nova",
  "orbit",
  "pixel",
  "pulse",
  "river",
  "sage",
  "signal",
  "spark",
  "stone",
  "swift",
  "tempo",
  "wave",
];

function randomId(length = 4) {
  return randomBytes(8).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, length);
}

function randomWord() {
  const index = randomBytes(1)[0] % WORDS.length;
  return WORDS[index];
}

export async function createMailbox() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = `${randomWord()}-${randomId()}`;
    const address = `${token}@${mailDomain}`;

    try {
      return await prisma.mailbox.create({
        data: {
          token,
          address,
          domain: mailDomain,
        },
        select: mailboxSelect,
      });
    } catch (error) {
      if (attempt === 7) {
        throw error;
      }
    }
  }

  throw new Error("Unable to generate a unique mailbox.");
}

export const mailboxSelect = {
  id: true,
  token: true,
  address: true,
  domain: true,
  isActive: true,
  createdAt: true,
} as const;

