"use client";

import { usePathname } from "next/navigation";
import { ReactNode, ViewTransition } from "react";

const journey = {
  "nav-forward": "journey-forward",
  "nav-back": "journey-back",
  default: "journey-fade",
};

/**
 * Keyed by route: on navigation the old page exits and the new one enters
 * as two separate snapshots, styled per direction in globals.css.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter={journey} exit={journey} default="none">
      <div className="page-shell">{children}</div>
    </ViewTransition>
  );
}
