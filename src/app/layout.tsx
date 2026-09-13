import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vouch — Verified Skill Identity, Team Formation & Campus Recruitment",
  description:
    "A skill-verification platform turning candidate claims into measurable, evidence-backed signals for hackathon teams and campus placement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 selection:bg-sky-100 selection:text-sky-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 bg-white py-6 text-xs text-zinc-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800">VOUCH</span>
                <span>— Evidence-backed skill verification infrastructure</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Next.js App Router</span>
                <span>·</span>
                <span>Supabase Architecture</span>
                <span>·</span>
                <span>WCAG 2.2 AA</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
