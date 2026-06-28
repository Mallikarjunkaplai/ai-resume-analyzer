"use client";

import { cn } from "@/lib/utils";

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  active?: boolean;
  rounded?: string;
}

/**
 * React Bits — Electric Border
 *
 * Uses a physically rotating oversized gradient div behind the card
 * instead of @property CSS Houdini (which has poor browser support).
 * The gradient div spins continuously, creating the visible "electric" effect.
 */
export function ElectricBorder({
  children,
  className,
  innerClassName,
  active = true,
  rounded = "rounded-2xl",
}: ElectricBorderProps) {
  return (
    <div
      className={cn("relative p-[2px] overflow-hidden", rounded, className)}
      style={{ background: active ? "transparent" : "#E2E8F0" }}
    >
      {/* ── Spinning gradient layer ─────────────────────── */}
      {active && (
        <div
          className="absolute inset-[-50%] z-0"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, #3B82F6 80deg, #60A5FA 140deg, #93C5FD 180deg, #3B82F6 220deg, transparent 300deg, transparent 360deg)",
            animation: "eb-spin 4s linear infinite",
          }}
        />
      )}

      {/* ── Inner card surface ──────────────────────────── */}
      <div
        className={cn(
          "relative z-10 h-full w-full bg-white",
          rounded,
          innerClassName
        )}
      >
        {children}
      </div>

      <style>{`
        @keyframes eb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
