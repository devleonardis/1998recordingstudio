"use client";

import {
  MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Sticky deck: each card pins under the header and the next one slides
 * over it, while the cards underneath sink back and dim.
 */
export function StackCards({ items }: { items: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  if (reduce) {
    return (
      <div ref={ref} className="grid gap-4">
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {items.map((item, i) => (
        <StackItem key={i} index={i} total={items.length} progress={scrollYProgress}>
          {item}
        </StackItem>
      ))}
    </div>
  );
}

function StackItem({
  children,
  index,
  total,
  progress,
}: {
  children: ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const targetScale = 1 - (total - index - 1) * 0.045;
  const scale = useTransform(progress, [start, 1], [1, targetScale]);
  const dim = useTransform(progress, [start, 1], [0, (total - index - 1) * 0.16]);
  const rotateX = useTransform(progress, [start, 1], [0, (total - index - 1) * -2.5]);

  return (
    <div
      className={`sticky flex items-start justify-center ${index === total - 1 ? "pb-10" : "h-[78vh] md:h-[86vh]"}`}
      style={{ top: `calc(96px + ${index * 22}px)` }}
    >
      <motion.div
        style={{ scale, rotateX, transformOrigin: "50% 0%", transformPerspective: 1200 }}
        className="relative w-full"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-black"
        />
      </motion.div>
    </div>
  );
}

/**
 * Pinned horizontal track: vertical scroll drives the cards sideways,
 * like scrubbing a DAW arrangement left to right.
 */
export function HorizontalTrack({
  children,
  label,
}: {
  children: ReactNode;
  label?: ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.04, 0.96], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0.04, 0.96], [0, 1]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 32));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  if (reduce) {
    return (
      <div ref={sectionRef}>
        {label}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-16">
        {label}
        <motion.div ref={trackRef} style={{ x }} className="mt-8 flex w-max gap-5 pr-8">
          {children}
        </motion.div>
        <div className="mt-8 h-px w-full max-w-md bg-white/10">
          <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-accent" />
        </div>
      </div>
    </div>
  );
}

/**
 * Infinite marquee whose speed and skew react to scroll velocity.
 */
export function Marquee({
  items,
  reverse = false,
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const row = [...items, ...items];
  return (
    <div className={`marquee-mask relative flex overflow-hidden ${className}`}>
      <div className={`marquee-track flex shrink-0 items-center gap-10 pr-10 ${reverse ? "marquee-reverse" : ""}`}>
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {item}
            <span aria-hidden className="h-2 w-2 rounded-full bg-accent/70" />
          </span>
        ))}
      </div>
      <div
        aria-hidden
        className={`marquee-track flex shrink-0 items-center gap-10 pr-10 ${reverse ? "marquee-reverse" : ""}`}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {item}
            <span className="h-2 w-2 rounded-full bg-accent/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
