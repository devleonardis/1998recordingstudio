"use client";

import { CSSProperties, PointerEvent, ReactNode, useRef } from "react";

/*
 * Pointer effects write a few CSS variables per pointer frame and let CSS
 * transitions do the smoothing (see .tilt / .magnetic in globals.css).
 * Nothing runs while idle, and touch input is ignored entirely.
 */

function useFrameThrottle() {
  const frame = useRef(0);
  return (fn: () => void) => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      fn();
    });
  };
}

/**
 * Aceternity-style 3D card: tilts toward the pointer and carries a soft
 * spotlight that follows it across the surface.
 */
export function TiltCard({
  children,
  className = "",
  max = 9,
  glow = "rgba(205,121,72,0.18)",
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const throttle = useFrameThrottle();

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    throttle(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.dataset.active = "";
    });
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    delete el.dataset.active;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--glow": glow } as CSSProperties}
      className={`tilt relative ${className}`}
    >
      {children}
      <div aria-hidden className="tilt-light pointer-events-none absolute inset-0 rounded-[inherit]" />
    </div>
  );
}

/** Pulls its child toward the pointer while hovered. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const throttle = useFrameThrottle();

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const { clientX, clientY } = e;
    throttle(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${(clientX - (rect.left + rect.width / 2)) * strength}px`);
      el.style.setProperty("--my", `${(clientY - (rect.top + rect.height / 2)) * strength}px`);
    });
  }

  function onLeave() {
    ref.current?.style.setProperty("--mx", "0px");
    ref.current?.style.setProperty("--my", "0px");
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="magnetic inline-flex">
      {children}
    </div>
  );
}

/** Aceternity "Spotlight": a slow cone of light sweeping the hero. */
export function Spotlight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`spotlight pointer-events-none absolute z-0 h-[169%] w-[138%] lg:w-[84%] ${className}`}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <ellipse
        cx="1924.71"
        cy="273.501"
        rx="1924.71"
        ry="273.501"
        transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        fill="url(#spotlight-fill)"
        fillOpacity="0.3"
      />
      <defs>
        <radialGradient id="spotlight-fill" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1924 273) rotate(90) scale(273 1924)">
          <stop stopColor="#F3C9A6" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#CD7948" stopOpacity="0.35" />
          <stop offset="1" stopColor="#CD7948" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
