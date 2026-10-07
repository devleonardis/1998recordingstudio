import { CSSProperties, ReactNode } from "react";

/*
 * Scroll effects are pure CSS scroll-driven animations (animation-timeline:
 * view()), see globals.css. They run on the compositor with zero JavaScript
 * per frame; browsers without support simply show the content in place.
 */

/**
 * Card that is "dealt" onto the page by the scroll position itself:
 * it tilts up from a 3D plane while it travels into view and reverses
 * when scrolling back, so the page feels scrubbed like a timeline.
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

/** Blur-free rise-in for text blocks; `delay` staggers it along the scroll. */
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
    <div className={`sd-reveal ${className}`} style={{ "--shift": `${delay * 40}%` } as CSSProperties}>
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

/** Element that lifts, shrinks and fades as you scroll past it. */
export function ParallaxOut({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`sd-parallax-out ${className}`}>{children}</div>;
}

/** Words fade in one by one (Aceternity "Text Generate Effect"), CSS only. */
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
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className={`tg-word inline-block ${accentWords.includes(word) ? "text-gradient-accent" : ""}`}
            style={{ animationDelay: `${delay + i * 0.07}s` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** One-time entrance on page load (CSS), staggered with `delay` seconds. */
export function IntroIn({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p" | "aside";
}) {
  return (
    <Tag className={`intro-in ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}
