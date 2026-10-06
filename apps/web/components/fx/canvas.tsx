"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * OriginKit-inspired "Fluid Trail": a glowing copper ribbon that follows the
 * pointer and dissolves. Desktop / fine pointers only; idles at zero cost.
 */
export function FluidTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const points: { x: number; y: number; life: number }[] = [];
    const MAX_LIFE = 34;
    let raf = 0;
    let running = false;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of points) p.life -= 1;
      while (points.length && points[0].life <= 0) points.shift();

      if (points.length > 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let i = 1; i < points.length - 1; i++) {
          const a = points[i - 1];
          const b = points[i];
          const c = points[i + 1];
          const t = b.life / MAX_LIFE;
          const midX1 = (a.x + b.x) / 2;
          const midY1 = (a.y + b.y) / 2;
          const midX2 = (b.x + c.x) / 2;
          const midY2 = (b.y + c.y) / 2;
          ctx.beginPath();
          ctx.moveTo(midX1, midY1);
          ctx.quadraticCurveTo(b.x, b.y, midX2, midY2);
          ctx.strokeStyle = `rgba(232, 150, 98, ${t * 0.55})`;
          ctx.lineWidth = 1 + t * 14;
          ctx.shadowColor = "rgba(205, 121, 72, 0.9)";
          ctx.shadowBlur = 18 * t;
          ctx.stroke();
        }
      }

      if (points.length) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const onMove = (e: PointerEvent) => {
      points.push({ x: e.clientX, y: e.clientY, life: MAX_LIFE });
      if (points.length > 60) points.shift();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-screen w-screen mix-blend-screen"
    />
  );
}

/**
 * Oscilloscope background for the hero: layered sine waves that swell
 * with pointer proximity and scroll speed — the studio "listening" to you.
 */
export function Waveform({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let energy = 0.25;
    let pointerX = 0.5;
    let lastScroll = window.scrollY;
    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const lines = [
      { amp: 0.16, freq: 1.6, speed: 0.9, alpha: 0.55, width: 1.6 },
      { amp: 0.11, freq: 2.4, speed: -1.2, alpha: 0.32, width: 1.1 },
      { amp: 0.2, freq: 1.1, speed: 0.6, alpha: 0.2, width: 1 },
      { amp: 0.07, freq: 3.6, speed: 1.8, alpha: 0.28, width: 0.8 },
    ];

    const frame = () => {
      const scrollDelta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      energy += (Math.min(1.4, 0.25 + scrollDelta / 40) - energy) * 0.06;
      t += 0.012;

      ctx.clearRect(0, 0, width, height);
      const mid = height * 0.55;

      for (const line of lines) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const nx = x / width;
          // Envelope peaks near the pointer, tapering to the edges.
          const env = Math.exp(-Math.pow((nx - pointerX) * 2.4, 2)) * 0.8 + Math.sin(nx * Math.PI) * 0.35;
          const y =
            mid +
            Math.sin(nx * Math.PI * 2 * line.freq + t * line.speed * 3) *
              Math.sin(nx * Math.PI * 3.1 - t * 1.3) *
              height *
              line.amp *
              env *
              energy;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(205, 121, 72, ${line.alpha})`;
        ctx.lineWidth = line.width;
        ctx.stroke();
      }

      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      energy = Math.min(1.4, energy + 0.03);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
