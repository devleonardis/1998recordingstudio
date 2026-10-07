import { CSSProperties, ReactNode } from "react";

/*
 * Scroll effects are CSS transitions toggled by one shared IntersectionObserver
 * (RevealObserver): no per-frame JavaScript, and content stays visible if
 * JS never runs. See .sd-* in globals.css.
 */

/**
 * Card that is "dealt" onto the page as it scrolls into view: it tilts up
 * from a 3D plane and settles in place. Siblings in a grid are staggered.
 */
export function ScrollCard({
  children,
  className = "",
  depth = 1,
}: {
  children: ReactNode;
  className?: string;
  /** 0..1.5 — how dramatic the tilt is. */
  depth?: number;
}) {
  return (
    <div className={`sd-card ${className}`} style={{ "--depth": depth } as CSSProperties}>
      <div className="sd-card-inner h-full">{children}</div>
    </div>
  );
}

/** Blur-free rise-in for text blocks; `delay` (seconds) staggers siblings. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`sd-reveal ${className}`} style={{ "--delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

/**
 * A full "scene": zooms forward out of the dark as it enters, so moving
 * between sections feels like travelling through rooms of the studio.
 */
export function Scene({
  children,
  className = "",
  id,
  chapter,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  chapter?: string;
}) {
  return (
    <section id={id} data-chapter={chapter} className={`sd-scene ${className}`}>
      {children}
    </section>
  );
}
