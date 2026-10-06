"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { MouseEvent, ReactNode, useRef } from "react";

function isFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
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
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 20 });
  const sy = useSpring(py, { stiffness: 180, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, ${glow}, transparent 60%)`;
  const lightOpacity = useMotionValue(0);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce || !isFinePointer()) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    lightOpacity.set(1);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    lightOpacity.set(0);
  }

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full rounded-[inherit]"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: light, opacity: lightOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        />
      </motion.div>
    </div>
  );
}

/** Pulls its child toward the pointer while hovered. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.3 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!isFinePointer()) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className="inline-flex"
    >
      {children}
    </motion.div>
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
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill="url(#spotlight-fill)"
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <radialGradient id="spotlight-fill" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1924 273) rotate(90) scale(273 1924)">
          <stop stopColor="#F3C9A6" />
          <stop offset="1" stopColor="#CD7948" stopOpacity="0" />
        </radialGradient>
        <filter id="spotlight-blur" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

/** Skews its content with scroll velocity — content "leans" into fast scrolls. */
export function VelocitySkew({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 90, damping: 30 });
  const skewY = useTransform(smooth, [-3000, 0, 3000], [3, 0, -3], { clamp: true });
  const x = useTransform(smooth, [-3000, 0, 3000], [60, 0, -60], { clamp: true });
  return (
    <motion.div style={reduce ? undefined : { skewY, x }} className={className}>
      {children}
    </motion.div>
  );
}

/** Element that parallaxes out (lift + blur + fade) as you scroll past it. */
export function ParallaxOut({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y, scale, opacity, filter }} className={className}>
      {children}
    </motion.div>
  );
}
