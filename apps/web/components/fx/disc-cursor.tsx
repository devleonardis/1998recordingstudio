"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], label, summary, select";

/**
 * Replaces the pointer with a spinning vinyl record. Desktop / fine pointers
 * only. Position is written straight to the transform once per frame; hover
 * and press states are CSS classes, so React never re-renders while moving.
 */
export function DiscCursor() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const root = document.documentElement;
    root.classList.add("has-disc-cursor");

    let x = -100;
    let y = -100;
    let frame = 0;
    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.dataset.visible = "";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      delete el.dataset.visible;
    };
    const onOver = (e: PointerEvent) => {
      // Events stop at an iframe's edge (e.g. the booking embed): hide the
      // disc there instead of leaving it frozen; the next move outside shows it.
      if ((e.target as Element | null)?.tagName === "IFRAME") return onLeave();
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      el.toggleAttribute("data-hover", Boolean(hit));
    };
    const onDown = () => el.toggleAttribute("data-pressed", true);
    const onUp = () => el.toggleAttribute("data-pressed", false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-disc-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ref} aria-hidden className="disc-cursor-root pointer-events-none fixed left-0 top-0 z-[90]">
      <div className="disc-cursor-scale -ml-[14px] -mt-[14px] h-7 w-7">
        <div className="disc-cursor h-full w-full rounded-full shadow-[0_0_0_1px_rgba(228,226,219,0.25),0_6px_18px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  );
}
