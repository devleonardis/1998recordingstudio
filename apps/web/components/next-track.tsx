"use client";

import { JourneyLink } from "./fx/journey-link";
import { Marquee } from "./fx/stack";
import { ScrollCard } from "./fx/reveal";

/**
 * End-of-page "next track" card: the site reads like a playlist, and every
 * page hands you forward to the next one.
 */
export function NextTrack({
  href,
  number,
  title,
  caption,
}: {
  href: string;
  number: string;
  title: string;
  caption: string;
}) {
  return (
    <ScrollCard className="mt-20 md:mt-28" depth={1.2}>
      <JourneyLink
        href={href}
        data-chapter="Prossima traccia"
        className="group relative block overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[radial-gradient(circle_at_20%_0%,rgba(212,133,58,0.22),transparent_50%),linear-gradient(180deg,#11151a,#0a0d10)] py-10 hover:translate-y-0 hover:border-accent/50 md:py-14"
      >
        <div className="flex items-center justify-between px-6 font-mono text-xs uppercase tracking-[0.2em] text-muted md:px-10">
          <span>
            <span className="text-accent">▶ Prossima traccia</span> · {number}
          </span>
          <span className="hidden sm:inline">{caption}</span>
        </div>
        <Marquee
          items={[title, title, title]}
          className="mt-6 font-[var(--font-space)] text-5xl font-semibold text-white/90 transition-colors duration-500 group-hover:text-accent sm:text-7xl md:text-8xl"
        />
        <div className="mt-6 flex items-center gap-3 px-6 text-sm text-muted md:px-10">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-accent group-hover:bg-accent group-hover:text-[#140d09]">
            →
          </span>
          Continua il viaggio
        </div>
      </JourneyLink>
    </ScrollCard>
  );
}
