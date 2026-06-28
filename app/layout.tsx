import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeAI — Analyze Your Resume with AI",
  description:
    "Get instant ATS score, keyword analysis, and AI-powered feedback on your resume. Land your dream job faster with ResumeAI.",
  keywords: ["resume analyzer", "ATS score", "AI resume", "job application", "resume feedback"],
  authors: [{ name: "ResumeAI" }],
  openGraph: {
    title: "ResumeAI — Analyze Your Resume with AI",
    description: "Get instant ATS score and AI-powered feedback on your resume.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("h-full", inter.variable, plusJakarta.variable, "font-sans", geist.variable)}
      >
        <body className="min-h-full flex flex-col antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
