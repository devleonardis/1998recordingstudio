"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const whatsappUrl = "https://wa.me/393883739941";

const services = [
  {
    code: "prod",
    title: "Produzione",
    subtitle: "Direzione artistica e costruzione del brano",
    description:
      "Perfetta se parti da un'idea e vuoi trasformarla in una direzione sonora credibile e coerente.",
    includes: ["Concept e reference", "Arrangiamento", "Direzione sonora"],
    detail:
      "Dal concept iniziale alla struttura completa del pezzo: arrangiamento, sound palette e direzione sonora coerente con il tuo progetto.",
  },
  {
    code: "rec",
    title: "Recording",
    subtitle: "Sessioni vocali e strumentali curate in studio",
    description:
      "Registri in un ambiente pronto, con monitoring preciso e supporto tecnico durante ogni take.",
    includes: ["Setup sessione", "Tracking", "Editing base"],
    detail:
      "Sessioni in studio con setup rapido, monitoring preciso e supporto tecnico durante la take per ottenere performance pulite e utilizzabili subito.",
  },
  {
    code: "mixmaster",
    title: "Mix & Master",
    subtitle: "Bilanciamento, impatto e resa finale",
    description:
      "Per dare al brano profondita, equilibrio e consistenza reale sulle piattaforme di ascolto.",
    includes: ["Mix completo", "Master finale", "Delivery pronta"],
    detail:
      "Ottimizzazione completa del brano: equilibrio frequenziale, profondita, pressione sonora e resa consistente su piattaforme streaming.",
  },
  {
    code: "noleggio",
    title: "Noleggio studio",
    subtitle: "Lo spazio pronto per lavorare con il tuo team",
    description:
      "Una soluzione lineare per producer e crew che vogliono un ambiente professionale gia configurato.",
    includes: ["Sala pronta", "Setup operativo", "Uso indipendente"],
    detail:
      "Utilizzo dello studio per producer e team creativi che vogliono lavorare in un ambiente professionale gia configurato.",
  },
] as const;

type Service = (typeof services)[number];

export function HomeServices() {
  const [active, setActive] = useState<Service | null>(null);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  function openBookingAndClose() {
    window.dispatchEvent(new Event("open-booking-dialog"));
    setActive(null);
  }

  return (
    <section id="servizi" className="py-10 md:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">Servizi</p>
        <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
          Servizi pensati per farti capire subito da dove partire.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted md:text-base">
          Ogni servizio include una descrizione di cosa ottieni e quando ha senso sceglierlo.
          Clicca per leggere tutti i dettagli prima di prenotare.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {services.map((service, index) => (
          <motion.button
            key={service.code}
            type="button"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={() => setActive(service)}
            className="group surface rounded-3xl border border-white/10 p-6 text-left hover:border-accent/55 hover:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{service.title}</p>
                <h3 className="mt-2 text-xl text-white">{service.subtitle}</h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted">{service.description}</p>

            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Cosa comprende</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {service.includes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-accent">
              <span>Apri dettagli</span>
              <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center sm:rounded-3xl sm:px-6 sm:py-6 md:flex-row md:text-left">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          Se non sai ancora quale servizio prenotare, scrivici su WhatsApp: ti indirizziamo verso
          la soluzione giusta prima della sessione.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="accent-hover hidden shrink-0 rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.14em] text-text sm:inline-flex"
        >
          Contattaci su WhatsApp
        </a>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-md"
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Dettagli servizio ${active.title}`}
          >
            <motion.article
              initial={{ opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="surface mx-auto my-8 w-[min(760px,100%)] rounded-2xl border border-white/15 p-5 sm:rounded-3xl sm:p-7 md:my-14"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-[var(--font-space)] text-3xl">{active.title}</h3>
                  <p className="mt-2 text-sm text-muted">{active.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-muted hover:border-accent/45 hover:text-text"
                >
                  Chiudi
                </button>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted">{active.detail}</p>

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Include</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.includes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openBookingAndClose}
                  className="accent-hover rounded-full border border-accent bg-accent/10 px-5 py-2 text-xs uppercase tracking-[0.14em] text-accent"
                >
                  Prenota sessione
                </button>
                <a
                  href="#contatti"
                  onClick={() => setActive(null)}
                  className="accent-hover rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.14em] text-text"
                >
                  Contatti
                </a>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
