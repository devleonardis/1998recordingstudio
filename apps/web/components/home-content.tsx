"use client";

import { motion } from "framer-motion";
import { HomeServices } from "@/components/home-services";

const whatsappUrl = "https://wa.me/393883739941";

const heroHighlights = [
  "Produzione, recording e finalizzazione in un unico spazio professionale.",
  "Supporto tecnico e artistico per far rendere meglio ogni sessione.",
  "Studio a Bari pensato per artisti, producer e team creativi.",
] as const;

const certifications = [
  {
    title: "Disco d'oro",
    detail: "Release seguite in studio e arrivate a una certificazione ufficiale.",
    tier: "gold",
    embedSrc: "https://open.spotify.com/embed/track/420QMNPnHsbAqkkxBt2ifJ?utm_source=generator",
  },
  {
    title: "Disco d'oro",
    detail: "Un risultato concreto che racconta la qualita del lavoro finale.",
    tier: "gold",
    embedSrc: "https://open.spotify.com/embed/album/7vBfg8AHLReQkqXuItmxFP?utm_source=generator",
  },
] as const;

const trustPoints = [
  "Approccio curato su performance, suono e resa finale.",
  "Workflow rapido, sessioni organizzate e file pronti alla consegna.",
  "Un ambiente premium che resta leggibile e accogliente anche su mobile.",
] as const;

const tierStyles: Record<"gold" | "platinum", { card: string; title: string }> = {
  gold: {
    card:
      "border-[#E6B85C]/40 bg-[radial-gradient(circle_at_18%_8%,rgba(230,184,92,0.30),rgba(28,20,7,0.92)_45%),linear-gradient(180deg,rgba(24,18,9,0.96),rgba(12,9,5,0.98))] shadow-[0_0_0_1px_rgba(230,184,92,0.16),0_18px_36px_rgba(30,20,8,0.45)]",
    title: "text-[#FFF0CC]",
  },
  platinum: {
    card:
      "border-[#C9D2DE]/45 bg-[radial-gradient(circle_at_18%_8%,rgba(201,210,222,0.30),rgba(14,18,22,0.92)_45%),linear-gradient(180deg,rgba(16,20,25,0.96),rgba(9,12,15,0.98))] shadow-[0_0_0_1px_rgba(201,210,222,0.16),0_18px_36px_rgba(12,16,22,0.45)]",
    title: "text-[#EAF1F8]",
  },
};

export function HomeContent() {
  function openBooking() {
    window.dispatchEvent(new Event("open-booking-dialog"));
  }

  return (
    <main className="pb-20 pt-5 md:pb-24 md:pt-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(38,41,82,0.34),rgba(12,16,19,0.82)_48%),linear-gradient(180deg,rgba(12,16,19,0.9),rgba(12,16,19,0.98))] px-4 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(205,121,72,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.06),transparent_18%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-accent">
              Studio di registrazione a Bari
            </div>
            <h1
              id="home-hero-title"
              className="mt-4 font-[var(--font-space)] text-[1.875rem] font-semibold leading-[0.96] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Produzione, recording e mix con un suono curato davvero.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base md:text-lg">
              19.98 Recording Studio ti accompagna dalla sessione alla versione finale del brano:
              riprese vocali e strumentali, direzione artistica, mix e master in uno spazio pensato
              per lavorare bene e pubblicare con sicurezza.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openBooking}
                className="accent-hover rounded-full border border-accent bg-accent px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] shadow-[0_14px_40px_rgba(205,121,72,0.28)]"
              >
                Prenota sessione
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="accent-hover hidden rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-text sm:inline-flex sm:items-center sm:justify-center"
              >
                Contattaci su WhatsApp
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="surface rounded-2xl border-white/12 p-5 sm:rounded-[1.75rem] sm:p-6"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-muted">A chi è rivolto</p>
            <h2 className="mt-3 font-[var(--font-space)] text-2xl text-white">Per artisti, vocalist, producer e team che vogliono lavorare bene.</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm font-medium text-white">Artisti e vocalist</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Sessioni curate, take piu fluide e supporto in studio mentre registri.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <p className="text-sm font-medium text-white">Producer e team</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Uno spazio pronto, affidabile e gia organizzato per lavorare senza perdere tempo.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-accent">Contatto diretto</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                WhatsApp: <span className="text-white">+39 388 3739941</span>
              </p>
              <p className="text-sm leading-6 text-muted">Via Umberto Minervini 25, Bari</p>
            </div>
          </motion.aside>
        </div>
      </section>

      <HomeServices />

      <section className="py-10 md:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Certificazioni</p>
            <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
              Lavori che hanno lasciato un segno anche fuori dallo studio.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
              La cura del suono conta quando arriva il momento di pubblicare. Qui sotto trovi
              release collegate al nostro lavoro in studio e certificate ufficialmente.
            </p>
            <div className="mt-6 space-y-3">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-muted"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {certifications.map((item) => (
              <article key={item.embedSrc} className={`rounded-3xl border p-6 ${tierStyles[item.tier].card}`}>
                <h3 className={`font-[var(--font-space)] text-2xl ${tierStyles[item.tier].title}`}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{item.detail}</p>
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  <iframe
                    src={item.embedSrc}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={item.title}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contatti" className="pb-4 pt-10 md:pb-8 md:pt-14">
        <div className="surface overflow-hidden rounded-2xl border-white/12 sm:rounded-[2rem]">
          <div className="grid gap-8 px-5 py-7 sm:px-6 sm:py-8 md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-muted">Contatti</p>
              <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
                Se hai un brano da registrare o finalizzare, possiamo partire da qui.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Raccontaci cosa devi fare, che tipo di sessione ti serve e in che fase si trova il
                progetto. Ti aiutiamo a capire il servizio giusto e ad arrivare in studio con un
                piano chiaro.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
                <p>WhatsApp: +39 388 3739941</p>
                <p>Email: 19.98recordingstudio@gmail.com</p>
                <p>Via Umberto Minervini 25, Bari</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={openBooking}
                className="accent-hover rounded-full border border-accent bg-accent px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] shadow-[0_14px_40px_rgba(205,121,72,0.24)]"
              >
                Prenota sessione
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="accent-hover hidden rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-center text-sm uppercase tracking-[0.14em] text-text sm:inline-flex sm:items-center sm:justify-center"
              >
                Contattaci su WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
