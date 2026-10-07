"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { getLenis } from "./smooth-scroll";

const SONG_SECONDS = 210;
const FPS = 25;

const tracks: [match: (p: string) => boolean, label: string][] = [
  [(p) => p === "/", "01 · Home"],
  [(p) => p.startsWith("/studio-registrazione-bari"), "02 · Studio"],
  [(p) => p.startsWith("/produzione-musicale"), "03 · Produzione"],
  [(p) => p.startsWith("/mix-master"), "04 · Mix & Master"],
  [(p) => p === "/blog", "05 · Blog"],
  [(p) => p.startsWith("/blog/"), "05 · Blog / Articolo"],
];

function timecode(progress: number) {
  const totalFrames = Math.round(progress * SONG_SECONDS * FPS);
  const frames = totalFrames % FPS;
  const seconds = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frames)}`;
}

type Chapter = { label: string; el: HTMLElement };

/**
 * The site as a DAW session: a playhead across the top (CSS scroll timeline),
 * a transport with running timecode, and clickable markers for every chapter.
 * One throttled scroll listener + one IntersectionObserver; no layout reads.
 */
export function DawHud() {
  const pathname = usePathname();
  const codeRef = useRef<HTMLSpanElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  const track = tracks.find(([match]) => match(pathname))?.[1] ?? "00 · Session";

  // Timecode + "is scrolling" + playhead fallback, at most once per frame.
  useEffect(() => {
    const cssPlayhead = CSS.supports("animation-timeline: scroll()");
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    let isScrolling = false;

    const paint = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (codeRef.current) codeRef.current.textContent = timecode(progress);
      if (!cssPlayhead && playheadRef.current) playheadRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
      if (!isScrolling) {
        isScrolling = true;
        setScrolling(true);
      }
      clearTimeout(idle);
      idle = setTimeout(() => {
        isScrolling = false;
        setScrolling(false);
      }, 420);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Chapters of the current page; the active one is tracked by an observer.
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const timer = setTimeout(() => {
      const found = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]")).map((el) => ({
        label: el.dataset.chapter ?? "",
        el,
      }));
      setChapters(found);
      setActive(0);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const index = found.findIndex((c) => c.el === entry.target);
              if (index !== -1) setActive(index);
            }
          }
        },
        // A thin band at 45% of the viewport: whatever crosses it is "playing".
        { rootMargin: "-45% 0px -54% 0px" },
      );
      found.forEach((c) => observer?.observe(c.el));
    }, 150);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [pathname]);

  function jump(el: HTMLElement) {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -90, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <div
        ref={playheadRef}
        aria-hidden
        className="playhead fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-accent/40 via-accent to-[#F3C9A6]"
      />

      <div className="daw-transport intro-in pointer-events-none fixed bottom-5 left-5 z-40 hidden items-center gap-3 rounded-full border border-white/10 bg-[#0c1013]/90 py-1.5 pl-1.5 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted md:flex [animation-delay:1s]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
          <ThinkingOrb state="listening" paused={!scrolling} size={20} theme="dark" />
        </span>
        <span className="flex items-center gap-1.5 text-accent">
          <span className={`h-1.5 w-1.5 rounded-full bg-accent ${scrolling ? "animate-pulse" : ""}`} />
          Rec
        </span>
        <span ref={codeRef} className="tabular-nums text-text">
          00:00:00:00
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span className="text-text/80">{track}</span>
        {chapters[active] ? (
          <>
            <span className="h-3 w-px bg-white/15" />
            <span key={chapters[active].label} className="hud-chapter text-muted">
              {chapters[active].label}
            </span>
          </>
        ) : null}
      </div>

      {chapters.length > 1 ? (
        <nav
          aria-label="Capitoli della pagina"
          className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
        >
          {chapters.map((c, i) => (
            <button
              key={`${c.label}-${i}`}
              type="button"
              onClick={() => jump(c.el)}
              className="group flex items-center gap-3"
              aria-label={`Vai a ${c.label}`}
            >
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.16em] transition-[opacity,transform] duration-300 ${
                  i === active
                    ? "translate-x-0 text-accent opacity-100"
                    : "translate-x-2 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              >
                {c.label}
              </span>
              <span
                className={`block h-[2px] rounded-full transition-[width,background-color] duration-500 ${
                  i === active ? "w-8 bg-accent" : "w-4 bg-white/25 group-hover:w-6 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </nav>
      ) : null}
    </>
  );
}
