"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

const ROUTE_ORDER = ["/", "/studio-registrazione-bari", "/produzione-musicale", "/mix-master", "/blog", "/prenota"];

function depth(path: string) {
  const clean = path.split("#")[0].split("?")[0] || "/";
  if (clean.startsWith("/blog/")) return ROUTE_ORDER.length;
  const index = ROUTE_ORDER.indexOf(clean);
  return index === -1 ? ROUTE_ORDER.length : index;
}

/**
 * Page snapshots are taller than the viewport: zoom the journey around what
 * the visitor is actually looking at, not the middle of the document.
 */
export function prepareJourney() {
  const shell = document.querySelector<HTMLElement>(".page-shell");
  if (!shell) return;
  const top = shell.getBoundingClientRect().top + window.scrollY;
  const root = document.documentElement.style;
  root.setProperty("--vt-old-oy", `${window.scrollY + window.innerHeight / 2 - top}px`);
  root.setProperty("--vt-new-oy", `${window.innerHeight / 2 - top}px`);
}

/** Direction of a navigation between two paths, for the page transition. */
export function journeyType(from: string, to: string) {
  return depth(to) < depth(from) ? "nav-back" : "nav-forward";
}

/**
 * next/link that tags the navigation with a direction, so the page
 * transition flies forward (deeper into the site) or back toward home.
 */
export function JourneyLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  const type = journeyType(pathname, href);

  return (
    <Link
      href={href}
      transitionTypes={[type]}
      onClick={(event) => {
        prepareJourney();
        onClick?.(event);
      }}
      {...props}
    />
  );
}
