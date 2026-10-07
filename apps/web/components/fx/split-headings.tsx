"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SplitText, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Every section heading on the page rises line by line out of a mask as it
 * scrolls into view (SplitText + ScrollTrigger), re-split on resize.
 */
export function SplitHeadings() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>(".page-shell main h2:not([data-no-split])").forEach((heading) => {
          SplitText.create(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 115,
                rotate: 2,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.09,
                scrollTrigger: { trigger: heading, start: "top 90%", once: true },
              }),
          });
        });
      });
    }, 120);
    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
