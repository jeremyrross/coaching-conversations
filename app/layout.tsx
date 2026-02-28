import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coaching Conversations",
  description: "Track 1-on-1 coaching sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-white text-zinc-900`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-sm font-semibold text-zinc-900">
              Coaching Conversations
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/team" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                Team
              </Link>
            </nav>
          </header>
          <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
