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
  glow = "rgba(212,133,58,0.18)",
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
