"use client";

import { BookingWizard } from "@/components/booking-wizard";

export function PrenotaContent() {
  return (
    <main className="pb-20 pt-5 md:pb-24 md:pt-10">
      {/* Header */}
      <div className="mb-10">
        <p className="mb-4 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
          19.98 Recording Studio · Bari
        </p>
        <h1
          className="mb-4 text-3xl font-semibold text-white sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-space)" }}
        >
          Prenota la tua Sessione
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[#B8ABA2]">
          Scegli il servizio, seleziona la data e lo slot disponibile. Il team del 19.98 Recording
          Studio di Bari confermerà la prenotazione entro 24 ore. Via Umberto Minervini 25, Bari.
        </p>
      </div>

      {/* Wizard */}
      <div className="mb-14">
        <BookingWizard />
      </div>

      {/* Info section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="surface rounded-2xl p-5">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Telefono</p>
          <a
            href="tel:+393883739941"
            className="text-sm text-[#E4E2DB] hover:text-[#CD7948]"
          >
            +39 388 3739941
          </a>
          <p className="mt-1 text-xs text-[#B8ABA2]">Chiamaci o scrivi su WhatsApp</p>
        </div>
        <div className="surface rounded-2xl p-5">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Email</p>
          <a
            href="mailto:19.98recordingstudio@gmail.com"
            className="break-all text-sm text-[#E4E2DB] hover:text-[#CD7948]"
          >
            19.98recordingstudio@gmail.com
          </a>
          <p className="mt-1 text-xs text-[#B8ABA2]">Risposta entro 24 ore</p>
        </div>
        <div className="surface rounded-2xl p-5">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Indirizzo</p>
          <p className="text-sm text-[#E4E2DB]">Via Umberto Minervini 25</p>
          <p className="text-sm text-[#E4E2DB]">70124 Bari (BA)</p>
          <p className="mt-1 text-xs text-[#B8ABA2]">Lun – Sab, 10:00 – 20:00</p>
        </div>
      </div>
    </main>
  );
}
