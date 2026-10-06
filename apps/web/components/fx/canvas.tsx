"use client";

import { useEffect, useRef } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
