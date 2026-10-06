"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** Current Lenis instance (null when reduced motion is on or before mount). */
export function getLenis() {
  return instance;
}

/**
 * Global inertial scroll. Renders nothing: it drives the native window scroll,
 * so framer-motion's useScroll and sticky positioning keep working untouched.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      autoRaf: true,
      anchors: { offset: -90 },
      // Modals and other inner scroll areas keep native scrolling.
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });
    instance = lenis;

    return () => {
      lenis.destroy();
      instance = null;
    };
  }, []);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const lenis = instance;
    if (!lenis) return;
    const hash = window.location.hash;
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    // Wait a frame so the incoming page is laid out before measuring.
    requestAnimationFrame(() => {
      lenis.resize();
      if (target) lenis.scrollTo(target, { offset: -90, immediate: true });
      else lenis.scrollTo(0, { immediate: true });
    });
  }, [pathname]);

  return null;
}
