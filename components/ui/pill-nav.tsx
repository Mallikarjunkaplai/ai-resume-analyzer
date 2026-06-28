"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PillNavProps {
  tabs: { label: string; href?: string; icon?: React.ReactNode; isActive?: boolean; onClick?: () => void }[];
}

/**
 * React Bits — Pill Nav
 * Premium glass-blur navigation bar with full site links,
 * mobile hamburger menu, and Clerk auth integration.
 */
export function PillNav({ tabs }: PillNavProps) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Brand ────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, #2563EB, #60A5FA)" }}
          >
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 tracking-tight">
            Resume<span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* ── Desktop Pill Tabs ──────────────────────── */}
        <nav
          className="hidden md:flex items-center gap-0.5 p-1 rounded-full"
          style={{
            background: "rgba(241, 245, 249, 0.8)",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {tabs.map((tab) => {
            const isAnchor = tab.href?.startsWith("#") ?? false;
            const isActive = tab.isActive !== undefined ? tab.isActive : (!isAnchor && tab.href && (pathname === tab.href || pathname.startsWith(tab.href + "/")));
            const Component = (tab.onClick ? "button" : (isAnchor ? "a" : Link)) as any;
            const props = tab.onClick 
              ? { onClick: () => { tab.onClick!(); setMobileOpen(false); } }
              : { href: tab.href!, onClick: () => setMobileOpen(false) };
              
            return (
              <Component
                key={tab.label}
                {...props}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "text-blue-700 bg-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                )}
              >
                {tab.icon}
                {tab.label}
              </Component>
            );
          })}
        </nav>

        {/* ── Right side: Auth + CTA ───────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-full hover:bg-blue-50"
              >
                Workspace
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-8 h-8 ring-2 ring-slate-200 hover:ring-blue-400 transition-all duration-200",
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="redirect">
                <button className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button
                  className="text-sm font-bold text-white px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                >
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* ── Mobile Hamburger ───────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* ── Mobile Menu Dropdown ─────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-16 left-0 right-0 border-b border-slate-200 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            {tabs.map((tab) => {
              const isAnchor = tab.href?.startsWith("#") ?? false;
              const isActive = tab.isActive !== undefined ? tab.isActive : (!isAnchor && tab.href && (pathname === tab.href || pathname.startsWith(tab.href + "/")));
              const Component = (tab.onClick ? "button" : (isAnchor ? "a" : Link)) as any;
              const props = tab.onClick 
                ? { onClick: () => { tab.onClick!(); setMobileOpen(false); } }
                : { href: tab.href!, onClick: () => setMobileOpen(false) };
                
              return (
                <Component
                  key={tab.label}
                  {...props}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left",
                    isActive
                      ? "text-blue-700 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </Component>
              );
            })}
            <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Go to Workspace
                </Link>
              ) : (
                <>
                  <SignInButton mode="redirect">
                    <button className="text-sm font-semibold text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button
                      className="text-sm font-bold text-white px-4 py-3 rounded-xl transition-all cursor-pointer text-center"
                      style={{ background: "linear-gradient(135deg, #2563EB, #3B82F6)" }}
                    >
                      Get Started Free
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
