"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { StudioLogo } from "./logo";
import { BookingDialog } from "./booking-dialog";

export function Nav() {
  const [openBooking, setOpenBooking] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    function openDialog() {
      setOpenBooking(true);
    }

    window.addEventListener("open-booking-dialog", openDialog);
    return () => window.removeEventListener("open-booking-dialog", openDialog);
  }, []);

  return (
    <>
      {!isAdminRoute && (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] items-center justify-between py-4">
            <Link href="/" aria-label="Home" className="accent-hover rounded-full p-1">
              <StudioLogo />
            </Link>
            <nav className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setOpenBooking(true)}
                className="accent-hover rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-text md:text-sm"
              >
                Prenota ora
              </button>
              <a
                href="https://wa.me/393883739941"
                target="_blank"
                rel="noreferrer"
                className="accent-hover rounded-full border border-accent bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.14em] text-accent md:text-sm"
              >
                Whatsapp
              </a>
            </nav>
          </div>
        </header>
      )}
      <BookingDialog open={openBooking} onClose={() => setOpenBooking(false)} />
    </>
  );
}
