"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const SELECTOR = ".sd-card, .sd-reveal, .sd-scene";

/**
 * One IntersectionObserver for every scroll reveal on the page: elements get
 * .is-in the first time they enter the viewport and are then forgotten.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const scan = () =>
      document.querySelectorAll(`${SELECTOR}`).forEach((el) => {
        if (!el.classList.contains("is-in")) observer.observe(el);
      });

    // Safety net for the first intersection after a route change: the new page
    // is swapped in during a view transition while the scroll resets under it,
    // and a missed callback would leave on-screen content hidden until the user
    // scrolls. Measure directly on the next frame and after the journey.
    const revealInView = () => {
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains("is-in")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < limit && rect.bottom > 0) {
          el.classList.add("is-in");
          observer.unobserve(el);
        }
      });
    };

    scan();
    document.documentElement.classList.add("reveal-armed");
    // Pick up content that streams in after the route commits.
    const mutations = new MutationObserver(scan);
    const shell = document.querySelector(".page-shell");
    if (shell) mutations.observe(shell, { childList: true, subtree: true });

    const frame = requestAnimationFrame(revealInView);
    const timers = [400, 1300].map((ms) => setTimeout(revealInView, ms));

    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
