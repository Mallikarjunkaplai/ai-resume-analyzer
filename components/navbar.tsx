"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { FileText } from "lucide-react";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism bar */}
      <div
        className="mx-auto mt-4 max-w-6xl rounded-2xl px-6 py-3 flex items-center justify-between"
        style={{
          background: "rgba(24, 24, 27, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
              boxShadow: "0 0 20px rgba(14,165,233,0.3)",
            }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-plus-jakarta), sans-serif",
              background: "linear-gradient(135deg, #fff 0%, #94A3B8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Resume<span style={{ WebkitTextFillColor: "#0ea5e9", color: "#0ea5e9" }}>AI</span>
          </span>
        </Link>

        {/* ── Nav Links (desktop) ───────────────────────── */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors duration-200">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors duration-200">
            How it Works
          </Link>
        </nav>

        {/* ── Auth Buttons ──────────────────────── */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 ring-2 ring-sky-500/40 hover:ring-sky-500/80 transition-all duration-200",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect">
                <button className="hidden sm:flex text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_24px_rgba(14,165,233,0.4)]"
                  style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}
                >
                  Get Started
                  <span className="text-xs opacity-80">→</span>
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
