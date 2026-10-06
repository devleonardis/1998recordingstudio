"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

const ROUTE_ORDER = ["/", "/studio-registrazione-bari", "/produzione-musicale", "/mix-master", "/blog"];

function depth(path: string) {
  const clean = path.split("#")[0].split("?")[0] || "/";
  if (clean.startsWith("/blog/")) return ROUTE_ORDER.length;
  const index = ROUTE_ORDER.indexOf(clean);
  return index === -1 ? ROUTE_ORDER.length : index;
}

/**
 * next/link that tags the navigation with a direction, so the page
 * transition flies forward (deeper into the site) or back toward home.
 */
export function JourneyLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const from = depth(pathname);
  const to = depth(href);
  const type = to < from ? "nav-back" : "nav-forward";

  return (
    <Link
      href={href}
      transitionTypes={[type]}
      onClick={(event) => {
        // Page snapshots are taller than the viewport: zoom around what the
        // visitor is actually looking at, not the middle of the document.
        const shell = document.querySelector<HTMLElement>(".page-shell");
        if (shell) {
          const top = shell.getBoundingClientRect().top + window.scrollY;
          const root = document.documentElement.style;
          root.setProperty("--vt-old-oy", `${window.scrollY + window.innerHeight / 2 - top}px`);
          root.setProperty("--vt-new-oy", `${window.innerHeight / 2 - top}px`);
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
