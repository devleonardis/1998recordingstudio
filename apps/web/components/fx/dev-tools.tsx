"use client";

import dynamic from "next/dynamic";

// Agentation: click any element in dev to annotate it and copy structured
// context for an AI coding agent. Stripped from production builds.
const Agentation =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((m) => m.Agentation), { ssr: false })
    : null;

export function DevTools() {
  return Agentation ? <Agentation /> : null;
}
