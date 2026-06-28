"use client";

import { cn } from "@/lib/utils";

/**
 * React Bits — Lightfall Background (Light Theme)
 *
 * Slow-drifting vertical light beams with a horizontal scan line.
 * Visible on the Slate-50 background — elegant blue/indigo glow.
 */
export function LightfallBackground({ className }: { className?: string }) {
  const beams = [
    { left: "8%",  delay: 0, duration: 18, width: 2, opacity: 0.12 },
    { left: "22%", delay: 3, duration: 22, width: 1.5, opacity: 0.1 },
    { left: "38%", delay: 6, duration: 16, width: 2.5, opacity: 0.14 },
    { left: "52%", delay: 1, duration: 20, width: 1.5, opacity: 0.11 },
    { left: "68%", delay: 4, duration: 24, width: 2, opacity: 0.13 },
    { left: "82%", delay: 8, duration: 15, width: 1.5, opacity: 0.1 },
    { left: "92%", delay: 2, duration: 19, width: 2, opacity: 0.09 },
  ];

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none select-none",
        className
      )}
      aria-hidden="true"
    >
      {beams.map((b, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0"
          style={{
            left: b.left,
            width: `${b.width}px`,
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              rgba(59,130,246,${b.opacity}) 20%,
              rgba(99,102,241,${b.opacity * 1.3}) 45%,
              rgba(59,130,246,${b.opacity * 0.8}) 70%,
              transparent 100%
            )`,
            animation: `lightfall-drift ${b.duration}s ease-in-out ${b.delay}s infinite alternate`,
            borderRadius: "999px",
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Horizontal scan line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(59,130,246,0.15) 30%, rgba(99,102,241,0.2) 50%, rgba(59,130,246,0.15) 70%, transparent 100%)",
          animation: "lightfall-scan 20s linear infinite",
          top: 0,
        }}
      />

      <style>{`
        @keyframes lightfall-drift {
          0%   { opacity: 0.4; transform: scaleX(1); }
          50%  { opacity: 1;   transform: scaleX(1.8); }
          100% { opacity: 0.6; transform: scaleX(1); }
        }
        @keyframes lightfall-scan {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
