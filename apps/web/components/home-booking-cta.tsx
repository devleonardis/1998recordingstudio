"use client";

import { useState } from "react";
import Link from "next/link";
import { BookingDialog } from "@/components/booking-dialog";

export function HomeBookingCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="accent-hover rounded-full border border-accent bg-accent/10 px-7 py-3 text-sm uppercase tracking-[0.12em]"
        >
          Prenota ora
        </button>
        <Link href="/servizi" className="accent-hover rounded-full border border-white/20 px-7 py-3 text-sm uppercase tracking-[0.12em]">
          Vedi servizi
        </Link>
      </div>

      <BookingDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
