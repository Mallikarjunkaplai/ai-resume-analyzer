"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * React Bits — Aurora Background
 * Animated, layered gradient orbs that shift and float,
 * creating an ethereal aurora-borealis-like effect.
 */
export default function AuroraBackground({
  className,
  children,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-[#050510]",
        className
      )}
    >
      {/* ── Aurora Layers ─────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Orb 1 — Violet, top-right */}
        <div
          className="absolute rounded-full mix-blend-screen filter blur-[120px] opacity-40"
          style={{
            width: "60vw",
            height: "60vw",
            maxWidth: 700,
            maxHeight: 700,
            top: "-20%",
            right: "-10%",
            background:
              "radial-gradient(circle at center, #7C3AED 0%, #A855F7 40%, transparent 70%)",
            animation: "aurora-drift-1 18s ease-in-out infinite alternate",
          }}
        />
        {/* Orb 2 — Cyan, bottom-left */}
        <div
          className="absolute rounded-full mix-blend-screen filter blur-[140px] opacity-30"
          style={{
            width: "55vw",
            height: "55vw",
            maxWidth: 650,
            maxHeight: 650,
            bottom: "-15%",
            left: "-10%",
            background:
              "radial-gradient(circle at center, #06B6D4 0%, #0EA5E9 40%, transparent 70%)",
            animation: "aurora-drift-2 22s ease-in-out infinite alternate",
          }}
        />
        {/* Orb 3 — Pink, center-left */}
        <div
          className="absolute rounded-full mix-blend-screen filter blur-[100px] opacity-20"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: 500,
            maxHeight: 500,
            top: "30%",
            left: "15%",
            background:
              "radial-gradient(circle at center, #EC4899 0%, #A855F7 50%, transparent 70%)",
            animation: "aurora-drift-3 15s ease-in-out infinite alternate",
          }}
        />
        {/* Orb 4 — Deep blue, center-right */}
        <div
          className="absolute rounded-full mix-blend-screen filter blur-[160px] opacity-25"
          style={{
            width: "50vw",
            height: "50vw",
            maxWidth: 600,
            maxHeight: 600,
            top: "20%",
            right: "5%",
            background:
              "radial-gradient(circle at center, #3B82F6 0%, #06B6D4 40%, transparent 70%)",
            animation: "aurora-drift-4 26s ease-in-out infinite alternate",
          }}
        />

        {/* Subtle grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className="relative z-10 w-full">{children}</div>

      <style>{`
        @keyframes aurora-drift-1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-40px, 30px) scale(1.08); }
          66%  { transform: translate(30px, -20px) scale(0.95); }
          100% { transform: translate(-20px, 40px) scale(1.05); }
        }
        @keyframes aurora-drift-2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(50px, -30px) scale(1.1); }
          66%  { transform: translate(-30px, 20px) scale(0.92); }
          100% { transform: translate(40px, -40px) scale(1.06); }
        }
        @keyframes aurora-drift-3 {
          0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
          50%  { transform: translate(30px, 30px) scale(1.12) rotate(10deg); }
          100% { transform: translate(-20px, -20px) scale(0.9) rotate(-5deg); }
        }
        @keyframes aurora-drift-4 {
          0%   { transform: translate(0, 0) scale(1); }
          40%  { transform: translate(-50px, 20px) scale(1.07); }
          100% { transform: translate(20px, -30px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
