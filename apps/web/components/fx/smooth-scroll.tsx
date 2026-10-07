"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** Current Lenis instance (null when reduced motion is on or before mount). */
export function getLenis() {
  return instance;
}

/**
 * Global inertial scroll, driven by GSAP's ticker so Lenis and every
 * ScrollTrigger update in the same frame. Renders nothing: it drives the
 * native window scroll, so sticky positioning keeps working untouched.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 0.95,
      autoRaf: false,
      anchors: { offset: -90 },
      // Modals, menus and other inner scroll areas keep native scrolling.
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });
    instance = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    // Wait a frame so the incoming page is laid out before measuring.
    requestAnimationFrame(() => {
      const lenis = instance;
      if (lenis) {
        lenis.resize();
        if (target) lenis.scrollTo(target, { offset: -90, immediate: true });
        else lenis.scrollTo(0, { immediate: true });
      }
      ScrollTrigger.refresh();
    });
  }, [pathname]);

  return null;
}
