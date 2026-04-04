"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookingWizard } from "@/components/booking-wizard";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BookingDialog({ open, onClose }: BookingDialogProps) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 overscroll-none bg-black/65 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Prenota sessione"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
            className="mx-auto h-[100dvh] w-full overflow-hidden bg-[radial-gradient(circle_at_top,rgba(38,41,82,0.45),rgba(8,10,12,0.98))] md:my-6 md:h-[92vh] md:w-[min(1080px,calc(100%-2rem))] md:rounded-3xl md:border md:border-white/15"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="no-scrollbar h-full overflow-y-auto overflow-x-hidden px-4 py-4 md:px-7 md:py-7">
              <BookingWizard compact onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
