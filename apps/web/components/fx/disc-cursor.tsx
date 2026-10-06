"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const INTERACTIVE = "a, button, [role='button'], label, summary, select";

/**
 * Replaces the pointer with a spinning vinyl record. Desktop / fine pointers
 * only; it grows over links and buttons and hides when the pointer leaves.
 */
export function DiscCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 50, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 900, damping: 50, mass: 0.2 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-disc-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      root.classList.remove("has-disc-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[90]"
    >
      <motion.div
        animate={{
          scale: pressed ? 0.8 : hovering ? 1.7 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="-ml-[14px] -mt-[14px] h-7 w-7"
      >
        <div
          className={`disc-cursor h-full w-full rounded-full shadow-[0_0_0_1px_rgba(228,226,219,0.25),0_6px_18px_rgba(0,0,0,0.5)] ${
            hovering ? "disc-cursor-fast" : ""
          }`}
        />
      </motion.div>
    </motion.div>
  );
}
