import type { Metadata } from "next";
import { BookingCalendar } from "@/components/booking-calendar";
import { findBookingSelection } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Prenota una sessione",
  description:
    "Prenota online la tua sessione al 19.98 Recording Studio di Bari: rec, produzione, mix e master, sessione completa o noleggio sala. Scegli giorno e orario tra gli slot liberi.",
  alternates: { canonical: "/prenota" },
  openGraph: {
    title: "Prenota una sessione | 19.98 Recording Studio Bari",
    description:
      "Prenota online la tua sessione al 19.98 Recording Studio di Bari. Scegli giorno e orario tra gli slot liberi.",
    url: "/prenota",
  },
};

export default async function PrenotaPage({
  searchParams,
}: {
  searchParams: Promise<{ servizio?: string }>;
}) {
  const { servizio } = await searchParams;
  const initial = findBookingSelection(servizio);

  return (
    <main className="pb-20 pt-5 md:pb-24 md:pt-10">
      <section data-chapter="Prenota" className="mb-10 md:mb-14">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#B8ABA2]">
          Traccia 06 · Prenota
        </div>
        <h1
          className="mb-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-space)" }}
        >
          Prenota la tua sessione
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[#B8ABA2] md:text-lg">
          Scegli il servizio e uno slot libero in calendario. Per dubbi su quale sessione fa per te
          scrivici su{" "}
          <a
            href="https://wa.me/393883739941"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>
      </section>

      <section data-chapter="Calendario">
        <BookingCalendar initial={initial} />
      </section>
    </main>
  );
}
