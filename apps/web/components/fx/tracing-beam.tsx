import { ReactNode } from "react";

/**
 * Aceternity "Tracing Beam": a copper signal line that fills as you read.
 * Driven by a CSS view timeline on the wrapper (see .beam in globals.css).
 */
export function TracingBeam({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`beam relative pl-6 md:pl-10 ${className}`}>
      <div aria-hidden className="absolute bottom-0 left-0 top-2 w-px bg-white/10 md:left-2">
        <div className="beam-fill absolute inset-0 origin-top bg-gradient-to-b from-[#F3C9A6] via-accent to-accent/0" />
        <span className="beam-dot absolute -left-[5px] -mt-[5px] h-[11px] w-[11px] rounded-full border border-accent bg-bg shadow-[0_0_18px_rgba(205,121,72,0.8)]" />
      </div>
      {children}
    </div>
  );
}
