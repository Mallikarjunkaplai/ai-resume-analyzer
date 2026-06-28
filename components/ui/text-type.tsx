"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextTypeProps {
  /** Array of strings to cycle through */
  words: string[];
  className?: string;
  /** Typing speed in ms per character */
  speed?: number;
  /** Delete speed in ms per character */
  deleteSpeed?: number;
  /** How long to pause after fully typing a word */
  pauseMs?: number;
  /** Cursor character */
  cursor?: string;
}

/**
 * React Bits — Text Type
 * A professional typewriter animation that cycles through words,
 * deletes them, and types the next one. Cursor blinks in sky-blue.
 */
export function TextType({
  words,
  className,
  speed = 90,
  deleteSpeed = 50,
  pauseMs = 2200,
  cursor = "|",
}: TextTypeProps) {
  const [display, setDisplay] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = words[wordIdx % words.length];

    if (phase === "typing") {
      if (charIdx < current.length) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, speed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pausing"), pauseMs);
        return () => clearTimeout(t);
      }
    }

    if (phase === "pausing") {
      setPhase("deleting");
    }

    if (phase === "deleting") {
      if (charIdx > 0) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        }, deleteSpeed);
        return () => clearTimeout(t);
      } else {
        setWordIdx(i => (i + 1) % words.length);
        setPhase("typing");
      }
    }
  }, [phase, charIdx, wordIdx, words, speed, deleteSpeed, pauseMs]);

  return (
    <span className={cn("inline", className)}>
      <span>{display || '\u200B'}</span>
      <span
        className="ml-0.5 font-thin"
        style={{
          color: "#38bdf8", // sky-400
          animation: "text-type-blink 1.1s step-end infinite",
        }}
      >
        {cursor}
      </span>
      <style>{`
        @keyframes text-type-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
