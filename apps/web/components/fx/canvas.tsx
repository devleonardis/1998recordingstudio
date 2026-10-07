"use client";

import { useEffect, useRef } from "react";

const FRAME_MS = 1000 / 30;

/**
 * Oscilloscope background for the hero: layered sine waves that swell
 * with pointer proximity and scroll speed — the studio "listening" to you.
 * Capped at 30fps and 1x resolution on small screens, paused offscreen.
 */
export function Waveform({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const dpr = small ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const step = small ? 8 : 6;
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let visible = false;
    let energy = 0.25;
    let target = 0.25;
    let pointerX = 0.5;
    let lastScroll = window.scrollY;
    let t = 0;

    const lines = [
      { amp: 0.16, freq: 1.6, speed: 0.9, color: "rgba(205, 121, 72, 0.55)", width: 1.6 },
      { amp: 0.11, freq: 2.4, speed: -1.2, color: "rgba(205, 121, 72, 0.32)", width: 1.1 },
      { amp: 0.2, freq: 1.1, speed: 0.6, color: "rgba(205, 121, 72, 0.2)", width: 1 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mid = height * 0.55;
      for (const line of lines) {
        ctx.beginPath();
        for (let x = 0; x <= width + step; x += step) {
          const nx = x / width;
          const env = Math.exp(-(((nx - pointerX) * 2.4) ** 2)) * 0.8 + Math.sin(nx * Math.PI) * 0.35;
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
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      target += (0.25 - target) * 0.08;
      energy += (target - energy) * 0.1;
      t += 0.024;
      draw();
    };

    const start = () => {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      target = Math.min(1.4, Math.max(target, 0.25 + delta / 40));
    };
    const onPointer = (e: PointerEvent) => {
      if (!visible) return;
      pointerX = Math.min(1, Math.max(0, e.clientX / window.innerWidth));
      target = Math.min(1.4, target + 0.02);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
