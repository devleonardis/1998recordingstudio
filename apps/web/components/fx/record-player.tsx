"use client";

import { usePathname, useRouter } from "next/navigation";
import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { ALBUM_ARTIST, ALBUM_TITLE, BonusSource, Track, buildAlbum, formatTime } from "@/lib/album";
import { JourneyLink, journeyType, prepareJourney } from "./journey-link";
import { getLenis } from "./smooth-scroll";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Chapter = { label: string; el: HTMLElement; at: number };

const END_THRESHOLD = 0.995;

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

function seekTo(fraction: number, smooth = true) {
  const y = Math.min(1, Math.max(0, fraction)) * maxScroll();
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, smooth ? { duration: 1.1 } : { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
}

/**
 * The site as a record. Every page is a track: scrolling *is* the playhead,
 * Play scrolls the page at the track's tempo and rolls into the next song,
 * and pushing past the end of a page "drops the needle" on the next track.
 *
 * Per-frame work is limited to one rAF-throttled scroll handler writing text
 * and attributes; the progress fill itself is a CSS scroll timeline.
 */
export function RecordPlayer({ bonus }: { bonus: BonusSource[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const album = useMemo(() => buildAlbum(bonus), [bonus]);

  const index = Math.max(
    0,
    album.findIndex((t) => t.href === pathname),
  );
  const track = album[index];
  const prev: Track | undefined = album[index - 1];
  const next: Track = album[(index + 1) % album.length];

  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const [listOpen, setListOpen] = useState(false);

  // Latest values for long-lived listeners.
  const live = useRef({ track, next, pathname, playing });
  live.current = { track, next, pathname, playing };

  function goTo(target: Track) {
    prepareJourney();
    router.push(target.href, { transitionTypes: [journeyType(live.current.pathname, target.href)] });
  }

  // Scroll → time, end-of-track state, spinning vinyl (no React renders).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cssFill = CSS.supports("animation-timeline: scroll()");
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const paint = () => {
      frame = 0;
      const progress = Math.min(1, window.scrollY / maxScroll());
      const { track: current } = live.current;
      if (timeRef.current) timeRef.current.textContent = formatTime(progress * current.duration);
      if (!cssFill && fillRef.current) fillRef.current.style.transform = `scaleX(${progress})`;
      root.toggleAttribute("data-at-end", progress >= END_THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
      root.setAttribute("data-spinning", "");
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!live.current.playing) root.removeAttribute("data-spinning");
      }, 500);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
    };
  }, [pathname]);

  // Chapters: markers on the progress bar + the one currently "playing".
  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const collect = () => {
      const max = maxScroll();
      const found = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]")).map((el) => ({
        label: el.dataset.chapter ?? "",
        el,
        at: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - 90) / max)),
      }));
      setChapters(found);
      return found;
    };
    const timer = setTimeout(() => {
      const found = collect();
      setActive(0);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const i = found.findIndex((c) => c.el === entry.target);
            if (i !== -1) setActive(i);
          }
        },
        { rootMargin: "-45% 0px -54% 0px" },
      );
      found.forEach((c) => observer?.observe(c.el));
    }, 250);
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(collect, 300);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [pathname]);

  // Play: scroll the page at the track's tempo, then roll into the next one.
  useEffect(() => {
    const root = rootRef.current;
    if (!playing || !root) return;
    root.setAttribute("data-spinning", "");
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    let advanceTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = maxScroll();
      if (window.scrollY >= max * END_THRESHOLD) {
        if (!advanceTimer) advanceTimer = setTimeout(() => goTo(live.current.next), 900);
        raf = requestAnimationFrame(tick);
        return;
      }
      carry += (max / live.current.track.duration) * dt;
      const step = Math.floor(carry);
      if (step >= 1) {
        carry -= step;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(window.scrollY + step, { immediate: true, force: true });
        else window.scrollBy(0, step);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(advanceTimer);
      root.removeAttribute("data-spinning");
    };
    // goTo reads live values; restart only on play state / route change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, pathname]);

  // Past the end of a page, keep scrolling to drop the needle on the next track.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let pull = 0;
    let decay: ReturnType<typeof setTimeout> | undefined;
    let fired = false;
    let touchY = 0;

    const setPull = (value: number) => {
      pull = Math.max(0, Math.min(1, value));
      root.style.setProperty("--pull", String(pull));
      root.toggleAttribute("data-pulling", pull > 0);
      if (pull >= 1 && !fired) {
        fired = true;
        goTo(live.current.next);
      }
      clearTimeout(decay);
      if (pull > 0 && !fired) decay = setTimeout(() => setPull(0), 700);
    };
    const atEnd = () => window.scrollY >= maxScroll() - 2;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && atEnd()) setPull(pull + e.deltaY / 900);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      touchY = y;
      if (dy > 0 && atEnd()) setPull(pull + dy / 420);
    };

    setPull(0);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      clearTimeout(decay);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // New track: the title "decodes" into place like a display finding the tag.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    if (prefersReducedMotion() || !el.textContent) {
      el.textContent = track.title;
      return;
    }
    const tween = gsap.to(el, {
      duration: 1,
      ease: "none",
      scrambleText: { text: track.title, chars: "01923456789#·/", speed: 0.6, revealDelay: 0.2 },
    });
    return () => {
      tween.kill();
    };
  }, [track.title]);

  useEffect(() => setListOpen(false), [pathname]);

  useEffect(() => {
    if (!listOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setListOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listOpen]);

  function onBarPointer(e: ReactPointerEvent<HTMLDivElement>) {
    const bar = e.currentTarget;
    const seek = (clientX: number, smooth: boolean) => {
      const rect = bar.getBoundingClientRect();
      seekTo((clientX - rect.left) / rect.width, smooth);
    };
    seek(e.clientX, true);
    bar.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => seek(ev.clientX, false);
    const up = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
      bar.removeEventListener("pointercancel", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
  }

  const chapter = chapters[active]?.label;

  return (
    <div
      ref={rootRef}
      className="record-player pointer-events-none fixed inset-x-0 bottom-0 z-[65] px-2 pb-2 sm:px-4 sm:pb-4 [&>*]:pointer-events-auto"
      style={{ "--pull": 0 } as CSSProperties}
    >
      {listOpen ? (
        <>
          <button
            type="button"
            aria-label="Chiudi tracklist"
            onClick={() => setListOpen(false)}
            className="fixed inset-0 -z-10 cursor-default bg-black/40 hover:translate-y-0"
          />
          <div
            data-lenis-prevent
            className="tracklist mx-auto mb-2 max-h-[60vh] w-full max-w-[1100px] overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#0e1215] p-3 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] sm:p-4"
          >
            <div className="flex items-end justify-between px-2 pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Album</p>
                <p className="font-[var(--font-space)] text-2xl text-white">{ALBUM_TITLE}</p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {album.filter((t) => !t.bonus).length} tracce · {album.filter((t) => t.bonus).length} bonus
              </p>
            </div>
            <ol className="grid gap-1">
              {album.map((t, i) => {
                const current = i === index;
                return (
                  <li key={t.href}>
                    {t.bonus && !album[i - 1]?.bonus ? (
                      <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                        Bonus track
                      </p>
                    ) : null}
                    <JourneyLink
                      href={t.href}
                      aria-current={current ? "true" : undefined}
                      className={`flex items-center gap-4 rounded-xl px-3 py-2.5 hover:translate-y-0 ${
                        current ? "bg-accent/15 text-white" : "text-text/85 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="w-6 font-mono text-xs text-muted">
                        {current ? <span className="eq-mini" aria-hidden><i /><i /><i /></span> : t.no}
                      </span>
                      <span className={`flex-1 truncate text-sm ${current ? "text-accent" : ""}`}>{t.title}</span>
                      <span className="font-mono text-xs tabular-nums text-muted">{formatTime(t.duration)}</span>
                    </JourneyLink>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      ) : null}

      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0e1215]/95 shadow-[0_-10px_50px_rgba(0,0,0,0.55)]">
        {/* Mobile: the progress line runs along the top edge of the bar */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-white/10 sm:hidden">
          <div className="player-fill h-full origin-left bg-accent" />
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-4 sm:py-3">
          {/* Now playing */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-[30%] sm:flex-none">
            <div aria-hidden className="player-vinyl vinyl relative h-11 w-11 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(228,226,219,0.18)] sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                <span className="font-mono text-xs text-accent">{track.no}</span> · <span ref={titleRef} />
              </p>
              <p className="truncate text-xs text-muted">
                {chapter ? (
                  <span key={chapter} className="hud-chapter inline-block">
                    {chapter}
                  </span>
                ) : (
                  ALBUM_ARTIST
                )}
              </p>
            </div>
          </div>

          {/* Transport + scrubber */}
          <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-1">
            <div className="flex items-center gap-1 sm:gap-3">
              {prev ? (
                <JourneyLink
                  href={prev.href}
                  aria-label={`Traccia precedente: ${prev.title}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:translate-y-0 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                    <path d="M6 5h2v14H6zM20 5v14L9 12z" />
                  </svg>
                </JourneyLink>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center text-white/20" aria-hidden>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 5h2v14H6zM20 5v14L9 12z" />
                  </svg>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!playing && window.scrollY >= maxScroll() * END_THRESHOLD) goTo(next);
                  setPlaying((p) => !p);
                }}
                aria-label={playing ? "Pausa" : "Riproduci: scorre la pagina da sola"}
                aria-pressed={playing}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-text text-[#0c1013] hover:translate-y-0 hover:scale-105"
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <JourneyLink
                href={next.href}
                aria-label={`Traccia successiva: ${next.title}`}
                className="next-btn relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:translate-y-0 hover:text-white"
              >
                <svg aria-hidden viewBox="0 0 36 36" className="pull-ring absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" pathLength={100} />
                </svg>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                  <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
                </svg>
              </JourneyLink>
            </div>

            <div className="hidden w-full items-center gap-3 sm:flex">
              <span ref={timeRef} className="w-10 text-right font-mono text-[11px] tabular-nums text-muted">
                0:00
              </span>
              <div
                role="slider"
                aria-label="Posizione nella traccia"
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                onPointerDown={onBarPointer}
                onKeyDown={(e) => {
                  const step = e.key === "ArrowRight" ? 0.05 : e.key === "ArrowLeft" ? -0.05 : 0;
                  if (step) seekTo(window.scrollY / maxScroll() + step);
                }}
                className="group relative flex h-4 flex-1 cursor-pointer items-center"
              >
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div ref={fillRef} className="player-fill absolute inset-0 origin-left rounded-full bg-text group-hover:bg-accent" />
                </div>
                {chapters.map((c, i) => (
                  <button
                    key={`${c.label}-${i}`}
                    type="button"
                    title={c.label}
                    aria-label={`Vai a ${c.label}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => seekTo(c.at)}
                    style={{ left: `${c.at * 100}%` }}
                    className={`absolute top-1/2 h-2.5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full hover:translate-y-[-50%] ${
                      i === active ? "bg-accent" : "bg-white/40 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
              <span className="w-10 font-mono text-[11px] tabular-nums text-muted">{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Next up + tracklist */}
          <div className="hidden items-center justify-end gap-3 sm:flex sm:w-[30%]">
            <div className="pull-hint min-w-0 text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                <span className="hint-default">A seguire</span>
                <span className="hint-end">Continua a scorrere ▾</span>
              </p>
              <p className="truncate text-xs text-text/85">
                {next.no} · {next.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              aria-expanded={listOpen}
              aria-label="Tracklist"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border hover:translate-y-0 ${
                listOpen ? "border-accent text-accent" : "border-white/15 text-muted hover:text-white"
              }`}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 6h11M4 12h11M4 18h7M18 8v10" />
                <circle cx="16" cy="18" r="2" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            aria-expanded={listOpen}
            aria-label="Tracklist"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-muted hover:translate-y-0 sm:hidden"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 6h11M4 12h11M4 18h7M18 8v10" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
