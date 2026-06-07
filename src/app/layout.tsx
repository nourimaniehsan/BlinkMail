import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlinkMail",
  description: "Instant anonymous email inboxes on spike.green.",
  applicationName: "BlinkMail",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050711",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen">
            <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
              <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 shadow-glow">
                  B
                </span>
                BlinkMail
              </Link>
              <nav className="flex items-center gap-3 text-xs font-medium text-slate-400 sm:text-sm">
                <Link className="transition hover:text-white" href="/privacy">
                  Privacy
                </Link>
                <Link className="transition hover:text-white" href="/terms">
                  Terms
                </Link>
                <Link className="transition hover:text-white" href="/abuse">
                  Abuse
                </Link>
              </nav>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

