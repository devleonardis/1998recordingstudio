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

    scan();
    document.documentElement.classList.add("reveal-armed");
    // Pick up content that streams in after the route commits.
    const mutations = new MutationObserver(scan);
    const shell = document.querySelector(".page-shell");
    if (shell) mutations.observe(shell, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
