"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

/** Aceternity "Tracing Beam": a copper signal line that fills as you read. */
export function TracingBeam({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 30%", "end 70%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  const dotY = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className={`relative pl-6 md:pl-10 ${className}`}>
      <div aria-hidden className="absolute bottom-0 left-0 top-2 w-px bg-white/10 md:left-2">
        <motion.div
          style={{ scaleY: reduce ? 1 : fill }}
          className="absolute inset-0 origin-top bg-gradient-to-b from-[#F3C9A6] via-accent to-accent/0"
        />
        <motion.span
          style={{ top: reduce ? "0%" : dotY }}
          className="absolute -left-[5px] -mt-[5px] h-[11px] w-[11px] rounded-full border border-accent bg-bg shadow-[0_0_18px_rgba(205,121,72,0.8)]"
        />
      </div>
      {children}
    </div>
  );
}
