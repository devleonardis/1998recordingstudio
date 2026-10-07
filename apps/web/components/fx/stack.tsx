"use client";

import { ReactNode, useRef } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Sticky deck: each card pins under the header and the next one slides
 * over it, while the cards underneath sink back and dim. One ScrollTrigger
 * drives every card.
 */
export function StackCards({ items }: { items: ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card", ref.current);
      const dims = gsap.utils.toArray<HTMLElement>(".stack-dim", ref.current);
      const total = cards.length;
      const setters = cards.map((card) => gsap.quickSetter(card, "css"));

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: ({ progress }) => {
          cards.forEach((_, i) => {
            const start = i / total;
            const depth = total - i - 1;
            const t = gsap.utils.clamp(0, 1, (progress - start) / (1 - start || 1));
            setters[i]({
              scale: 1 - depth * 0.045 * t,
              rotateX: depth * -2.5 * t,
              transformPerspective: 1200,
            });
            dims[i].style.opacity = String(depth * 0.16 * t);
          });
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative">
      {items.map((item, i) => (
        <div
          key={i}
          className={`sticky flex items-start justify-center ${i === items.length - 1 ? "pb-10" : "h-[78vh] md:h-[86vh]"}`}
          style={{ top: `calc(96px + ${i * 22}px)` }}
        >
          <div className="stack-card relative w-full origin-top">
            {item}
            <div aria-hidden className="stack-dim pointer-events-none absolute inset-0 rounded-[2rem] bg-black opacity-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pinned horizontal track: vertical scroll drives the cards sideways,
 * like scrubbing a DAW arrangement left to right.
 */
export function HorizontalTrack({ children, label }: { children: ReactNode; label?: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || prefersReducedMotion()) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 32);
      // The sticky stage needs scroll room equal to the horizontal travel.
      const size = () => {
        section.style.height = `calc(100vh + ${distance()}px)`;
      };
      size();

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: size,
          },
        })
        .to(track, { x: () => -distance(), ease: "none" }, 0)
        .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
    },
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef} className="relative">
      <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden pt-16 motion-reduce:static motion-reduce:min-h-0">
        {label}
        <div
          ref={trackRef}
          className="mt-8 flex w-max gap-5 pr-8 motion-reduce:grid motion-reduce:w-auto motion-reduce:grid-cols-1 motion-reduce:pr-0 sm:motion-reduce:grid-cols-2 lg:motion-reduce:grid-cols-3"
        >
          {children}
        </div>
        <div className="mt-8 h-px w-full max-w-md bg-white/10 motion-reduce:hidden">
          <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}

/** Infinite marquee (CSS), paused on hover. */
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
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={`marquee-track flex shrink-0 items-center gap-10 pr-10 ${reverse ? "marquee-reverse" : ""}`}
        >
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {item}
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent/70" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
