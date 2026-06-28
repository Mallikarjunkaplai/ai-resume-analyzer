"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PrismBackgroundProps {
  className?: string;
}

/**
 * React Bits — Prism Background (Light Theme)
 *
 * Smooth, evenly distributed floating gradient orbs that drift
 * and pulse gently. Uses radial gradients (not triangulated mesh)
 * for an even, polished look on light backgrounds.
 *
 * Paper-friendly palette: sky blue, soft indigo, gentle teal.
 */
export function PrismBackground({ className }: PrismBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // Orbs — smooth, distributed blobs
    const orbCount = 8;
    const orbs: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: [number, number, number];
      alpha: number;
      pulseSpeed: number;
      pulsePhase: number;
    }[] = [];

    const palette: [number, number, number][] = [
      [59, 130, 246],   // Blue-500
      [99, 102, 241],   // Indigo-500
      [14, 165, 233],   // Sky-500
      [45, 212, 191],   // Teal-400
      [139, 92, 246],   // Violet-500
      [59, 130, 246],   // Blue-500
      [6, 182, 212],    // Cyan-500
      [37, 99, 235],    // Blue-600
    ];

    // Distribute orbs evenly across the canvas
    for (let i = 0; i < orbCount; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      orbs.push({
        x: (col + 0.5) * (width / 4) + (Math.random() - 0.5) * (width / 8),
        y: (row + 0.5) * (height / 2) + (Math.random() - 0.5) * (height / 6),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 150 + Math.random() * 120,
        color: palette[i % palette.length],
        alpha: 0.18 + Math.random() * 0.12,
        pulseSpeed: 0.003 + Math.random() * 0.004,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time++;

      orbs.forEach((orb) => {
        // Drift
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Soft bounce
        if (orb.x < -orb.radius) orb.x = width + orb.radius;
        if (orb.x > width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = height + orb.radius;
        if (orb.y > height + orb.radius) orb.y = -orb.radius;

        // Pulse alpha
        const pulse = Math.sin(time * orb.pulseSpeed + orb.pulsePhase);
        const currentAlpha = orb.alpha + pulse * 0.03;
        const currentRadius = orb.radius + pulse * 15;

        // Draw radial gradient orb
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, currentRadius
        );
        gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${currentAlpha})`);
        gradient.addColorStop(0.5, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${currentAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none select-none",
        className
      )}
      style={{ zIndex: 0 }}
    />
  );
}
