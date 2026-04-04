"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function OpeningSequence() {
  const [show, setShow] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [handoff, setHandoff] = useState({ x: 0, y: 0, scale: 1, active: false });
  const [collapseExtras, setCollapseExtras] = useState(false);
  const introTitleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const storageKey = "opening-seen-v1";
    const hasSeenOpening = window.sessionStorage.getItem(storageKey) === "1";
    if (hasSeenOpening) {
      setIsReady(true);
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    setShow(true);
    setIsReady(true);

    const target = document.getElementById("home-hero-title");
    if (target) {
      target.style.opacity = "0";
      target.style.transition = "opacity 260ms ease";
    }

    const handoffTimer = setTimeout(() => {
      const heroTitle = document.getElementById("home-hero-title");
      const introTitle = introTitleRef.current;

      setCollapseExtras(true);

      if (heroTitle && introTitle) {
        const targetRect = heroTitle.getBoundingClientRect();
        const sourceRect = introTitle.getBoundingClientRect();
        const sourceCenterX = sourceRect.left + sourceRect.width / 2;
        const sourceCenterY = sourceRect.top + sourceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        setHandoff({
          x: targetCenterX - sourceCenterX,
          y: targetCenterY - sourceCenterY,
          scale: Math.min(targetRect.width / Math.max(sourceRect.width, 1), targetRect.height / Math.max(sourceRect.height, 1)),
          active: true,
        });
      }
    }, 1250);

    const revealTitleTimer = setTimeout(() => {
      const heroTitle = document.getElementById("home-hero-title");
      if (heroTitle) {
        heroTitle.style.opacity = "1";
      }
    }, 1880);

    const closeTimer = setTimeout(() => setShow(false), 2140);
    return () => {
      clearTimeout(handoffTimer);
      clearTimeout(revealTitleTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  if (!isReady || !show) return null;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55 } }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#06080b]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(205,121,72,0.22),transparent_45%),radial-gradient(circle_at_15%_80%,rgba(38,41,82,0.3),transparent_40%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(228,226,219,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(228,226,219,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />

          <div className="w-[min(90vw,760px)] text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: collapseExtras ? 0 : 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-xs uppercase tracking-[0.6em] text-muted"
            >
              Signal Locked
            </motion.div>
            <motion.h2
              ref={introTitleRef}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={
                handoff.active ? { opacity: 1, x: handoff.x, y: handoff.y, scale: handoff.scale } : { opacity: 1, scale: 1, y: 0, x: 0 }
              }
              transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }}
              style={{ transformOrigin: "center center" }}
              className="mt-5 font-[var(--font-space)] text-4xl font-semibold tracking-[0.01em] text-text md:text-6xl"
            >
              1998 Recording Studio
            </motion.h2>
            <motion.div
              initial={{ width: 0, opacity: 1 }}
              animate={{ width: "100%", opacity: collapseExtras ? 0 : 1 }}
              transition={{ duration: 1.1, delay: 0.3 }}
              className="mx-auto mt-6 h-[2px] max-w-[440px] bg-gradient-to-r from-transparent via-accent to-transparent"
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
