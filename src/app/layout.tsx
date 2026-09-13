import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth/auth-context";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vouch — The Verification Ledger",
  description:
    "Standardized blueprint assessment integrity, normalized code evidence, and explainable technical matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBFAF7] text-[#3D3A31] font-body selection:bg-[#E9EFF5] selection:text-[#1B3A5C]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#D9D5C7] bg-[#FBFAF7] py-6 text-xs text-[#8A8571]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1B3A5C] tracking-wide font-display">VOUCH</span>
                <span className="text-[#D9D5C7]">|</span>
                <span>The Verification Ledger — Technical Evidence Infrastructure</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-[#8A8571]">
                <span>LEDGER v3.0</span>
                <span>·</span>
                <span>BLUEPRINT SPEC</span>
                <span>·</span>
                <span>WCAG 2.1 AA</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
