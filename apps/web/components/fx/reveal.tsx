"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Card that is "dealt" onto the page by the scroll position itself:
 * it tilts up from a 3D plane while it travels into view and reverses
 * when scrolling back, so the page feels scrubbed like a timeline.
 */
export function ScrollCard({
  children,
  className,
  depth = 1,
}: {
  children: ReactNode;
  className?: string;
  /** 0..1.5 — how dramatic the tilt is. */
  depth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 98%", "start 62%"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  const rotateX = useTransform(p, [0, 1], [26 * depth, 0]);
  const y = useTransform(p, [0, 1], [90 * depth, 0]);
  const scale = useTransform(p, [0, 1], [0.9, 1]);
  const opacity = useTransform(p, [0, 0.55, 1], [0, 0.85, 1]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className} style={{ perspective: 1100 }}>
      <motion.div
        style={{ rotateX, y, scale, opacity, transformOrigin: "50% 100%" }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** One-shot blur-up reveal for text blocks. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "header";
}) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/**
 * A full "scene": zooms forward out of the dark as it enters, so moving
 * between sections feels like travelling through rooms of the studio.
 */
export function Scene({
  children,
  className,
  id,
  chapter,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  chapter?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 35%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const scale = useTransform(p, [0, 1], [0.88, 1]);
  const opacity = useTransform(p, [0, 0.6, 1], [0.15, 0.9, 1]);
  const radius = useTransform(p, [0, 1], [56, 0]);

  return (
    <motion.section
      ref={ref}
      id={id}
      data-chapter={chapter}
      style={reduce ? undefined : { scale, opacity, borderRadius: radius }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/** Words fade in from blur one by one (Aceternity "Text Generate Effect"). */
export function TextGenerate({
  text,
  className,
  delay = 0,
  accentWords = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  accentWords?: string[];
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <motion.span
            initial={reduce ? false : { opacity: 0, filter: "blur(12px)", y: "0.35em" }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.7, delay: delay + i * 0.07, ease }}
            className={`inline-block ${accentWords.includes(word) ? "text-gradient-accent" : ""}`}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
