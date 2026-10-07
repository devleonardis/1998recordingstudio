"use client";

import { LiquidMetal, MeshGradient } from "@paper-design/shaders-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAIN_TRACKS, formatTime } from "@/lib/album";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { JourneyLink } from "./fx/journey-link";
import { getLenis } from "./fx/smooth-scroll";

const ARM_REST = -10;
const ARM_STEP = 4.5;

/**
 * Full-screen menu as a record sleeve: the cover art is a live shader, the
 * vinyl slides out of the sleeve and the tonearm swings to the track you
 * point at. Everything is mounted only while open.
 */
export function SleeveMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [rendered, setRendered] = useState(open);
  const [wide, setWide] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const current = MAIN_TRACKS.findIndex((t) =>
    t.href === "/" ? pathname === "/" : pathname === t.href || pathname.startsWith(`${t.href}/`),
  );
  const armTarget = hovered ?? (current === -1 ? null : current);

  useEffect(() => {
    if (open) setRendered(true);
    else if (tl.current) tl.current.timeScale(1.8).reverse();
    else setRendered(false);
  }, [open]);

  useEffect(() => {
    setWide(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  // Scroll lock + Escape while the sleeve is out.
  useEffect(() => {
    if (!rendered) return;
    const lenis = getLenis();
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [rendered, onClose]);

  useGSAP(
    () => {
      if (!rendered || !root.current) return;
      const q = gsap.utils.selector(root);
      const reduce = prefersReducedMotion();
      const timeline = gsap.timeline({
        defaults: { ease: "expo.out" },
        onReverseComplete: () => {
          tl.current = null;
          setRendered(false);
        },
      });

      if (reduce) {
        timeline.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      } else {
        timeline
          .fromTo(
            root.current,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" },
          )
          .fromTo(q(".sleeve-vinyl"), { xPercent: 70, rotate: -160 }, { xPercent: 0, rotate: 0, duration: 1.4 }, 0.35)
          .fromTo(q(".sleeve-arm"), { rotate: ARM_REST - 25 }, { rotate: ARM_REST, duration: 1 }, 0.6)
          .fromTo(q(".sleeve-title"), { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.06 }, 0.4)
          .fromTo(
            q(".sleeve-meta"),
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04 },
            0.6,
          )
          .fromTo(q(".sleeve-foot"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.75);
      }
      tl.current = timeline;
      q<HTMLElement>(".sleeve-title-link")[0]?.focus({ preventScroll: true });
    },
    { dependencies: [rendered], scope: root },
  );

  // Tonearm swings to the hovered (or playing) track.
  useGSAP(
    () => {
      if (!rendered) return;
      gsap.to(".sleeve-arm", {
        rotate: armTarget === null ? ARM_REST : 10 + armTarget * ARM_STEP,
        duration: 0.9,
        ease: "elastic.out(1, 0.6)",
        overwrite: "auto",
      });
    },
    { dependencies: [armTarget, rendered], scope: root },
  );

  if (!rendered) return null;

  return (
    <div
      ref={root}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label="Menu · Tracklist"
      className="sleeve fixed inset-0 z-[80] flex flex-col overflow-y-auto overflow-x-hidden bg-[#07090b] text-text"
    >
      {/* Cover art: a live shader in the studio colours */}
      <MeshGradient
        className="pointer-events-none !absolute inset-0"
        colors={["#07090b", "#1d1b3a", "#cd7948", "#262952", "#0c1013"]}
        distortion={0.85}
        swirl={0.35}
        grainOverlay={0.35}
        speed={0.22}
        maxPixelCount={wide ? 1_200_000 : 450_000}
        minPixelRatio={1}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(7,9,11,0.35),rgba(7,9,11,0.88)_70%)]" />

      {/* The record sliding out of the sleeve */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[22vw] -right-[38vw] h-[95vw] w-[95vw] md:bottom-auto md:right-[3vw] md:top-[54%] md:h-[66vh] md:w-[66vh] md:-translate-y-1/2"
      >
        <div className="sleeve-vinyl relative h-full w-full">
          <div className={`sleeve-spin absolute inset-0 ${hovered !== null ? "is-cueing" : ""}`}>
          <div className="sleeve-grooves absolute inset-0 rounded-full shadow-[0_40px_120px_rgba(0,0,0,0.7)]" />
          <div className="absolute inset-[33%] overflow-hidden rounded-full">
            {wide ? (
              <LiquidMetal
                className="!absolute inset-0"
                colorBack="#cd7948"
                colorTint="#ffe6cc"
                shape="circle"
                repetition={4}
                softness={0.45}
                distortion={0.12}
                contour={0.4}
                speed={0.6}
                maxPixelCount={260_000}
                minPixelRatio={1}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,#f3c9a6,#cd7948_45%,#7a3e1d)]" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-[#140d09]">
              <span className="font-[var(--font-space)] text-[clamp(14px,3.4vw,30px)] font-bold leading-none">19.98</span>
              <span className="mt-1 font-mono text-[clamp(6px,1vw,10px)] uppercase tracking-[0.2em]">Lato A · 33⅓</span>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 h-[3%] w-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#07090b]" />
          </div>
        </div>
        {/* Tonearm: pivot top-right of the platter */}
        <svg
          viewBox="0 0 200 400"
          className="sleeve-arm absolute -right-[10%] -top-[16%] hidden h-[80%] origin-[78%_10%] md:block"
          style={{ transform: `rotate(${ARM_REST}deg)` }}
        >
          <circle cx="156" cy="40" r="26" fill="#1a1d22" stroke="#3a3f47" strokeWidth="3" />
          <circle cx="156" cy="40" r="9" fill="#cd7948" />
          <path d="M156 40 L150 300 L110 360" fill="none" stroke="#c9d2de" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="88" y="350" width="40" height="22" rx="4" transform="rotate(-38 108 361)" fill="#2b3038" stroke="#c9d2de" strokeWidth="2" />
        </svg>
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
        <p className="sleeve-foot font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
          <span className="text-accent">19.98</span> · Tracklist · Lato A
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi menu"
          className="sleeve-foot flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 hover:translate-y-0 hover:border-accent"
        >
          <span className="absolute h-[1.5px] w-5 rotate-45 bg-text" />
          <span className="absolute h-[1.5px] w-5 -rotate-45 bg-text" />
        </button>
      </div>

      {/* Tracklist */}
      <nav aria-label="Tracklist" className="relative z-10 flex flex-1 flex-col justify-center px-5 py-8 sm:px-8 md:max-w-[62%]">
        <ol>
          {MAIN_TRACKS.map((track, i) => {
            const isCurrent = i === current;
            return (
              <li key={track.href} className="border-b border-white/10 last:border-b-0">
                <JourneyLink
                  href={track.href}
                  onClick={onClose}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  aria-current={isCurrent ? "page" : undefined}
                  className="sleeve-title-link group flex items-baseline gap-4 py-3 outline-none hover:translate-y-0 sm:gap-6 sm:py-4"
                >
                  <span className="sleeve-meta w-8 shrink-0 font-mono text-xs text-muted">
                    {isCurrent ? <span className="eq-mini" aria-label="In riproduzione"><i /><i /><i /></span> : track.no}
                  </span>
                  <span className="-mb-[0.18em] block flex-1 overflow-hidden pb-[0.18em]">
                    <span
                      className={`sleeve-title block font-[var(--font-space)] text-[11vw] font-semibold leading-[0.95] tracking-tight transition-[color,transform] duration-500 group-hover:translate-x-3 group-focus-visible:translate-x-3 sm:text-6xl lg:text-7xl ${
                        isCurrent ? "text-accent" : "text-white group-hover:text-accent"
                      }`}
                    >
                      {track.title}
                    </span>
                  </span>
                  <span className="sleeve-meta hidden font-mono text-xs tabular-nums text-muted sm:inline">
                    {formatTime(track.duration)}
                  </span>
                </JourneyLink>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Liner notes */}
      <div className="relative z-10 grid gap-3 px-5 pb-8 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-8 sm:px-8 sm:pb-10">
        <a
          href="https://wa.me/393883739941"
          target="_blank"
          rel="noreferrer"
          className="sleeve-foot inline-flex items-center justify-center gap-3 rounded-full bg-accent px-7 py-4 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] hover:translate-y-0 hover:bg-[#e08b58]"
        >
          Prenota su WhatsApp
        </a>
        <div className="sleeve-foot grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted sm:text-right md:max-w-[62%]">
          <span>Via Minervini 25, Bari</span>
          <span>Lun–Sab 10–20</span>
          <a href="mailto:19.98recordingstudio@gmail.com" className="col-span-2 normal-case tracking-normal hover:text-accent">
            19.98recordingstudio@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
