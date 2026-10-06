"use client";

import { ViewTransition, useEffect, useState } from "react";
import { Reveal } from "./fx/reveal";
import { StackCards } from "./fx/stack";
import { JourneyLink } from "./fx/journey-link";
import { getLenis } from "./fx/smooth-scroll";

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
    href: "/produzione-musicale",
    morph: "svc-prod",
    tint: "from-[#262952]/60",
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
    href: "/studio-registrazione-bari",
    morph: "svc-rec",
    tint: "from-[#5a2c17]/55",
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
    href: "/mix-master",
    morph: "svc-mix",
    tint: "from-[#1D1B3A]/80",
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
    href: "/studio-registrazione-bari",
    morph: null,
    tint: "from-[#3b2a1c]/60",
  },
] as const;

type Service = (typeof services)[number];

/** Animated channel meter — every card gets its own "signal". */
function Meter({ seed }: { seed: number }) {
  return (
    <div aria-hidden className="flex h-full items-end gap-[3px]">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="eq-bar w-full rounded-t-sm bg-gradient-to-t from-accent/30 via-accent/70 to-[#F3C9A6]"
          style={{
            animationDelay: `${-((i * 137 + seed * 61) % 1000) / 1000}s`,
            animationDuration: `${0.9 + ((i * 7 + seed * 3) % 9) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}

function ServiceCard({ service, index, onPreview }: { service: Service; index: number; onPreview: () => void }) {
  const title = (
    <h3 className="font-[var(--font-space)] text-4xl font-semibold leading-none text-white sm:text-5xl md:text-6xl">
      {service.title}
    </h3>
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d1014] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:p-8 md:p-10`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${service.tint} to-transparent`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(205,121,72,0.16),transparent_40%)]" />
      <JourneyLink
        href={service.href}
        aria-label={`Scopri ${service.title}`}
        className="absolute inset-0 z-10 hover:translate-y-0"
      />
      <div className="relative grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span className="text-accent">CH 0{index + 1}</span>
            <span className="h-px w-10 bg-white/20" />
            <span>{service.code}</span>
          </div>
          <div className="mt-5">
            {service.morph ? (
              <ViewTransition name={service.morph} share="morph">
                {title}
              </ViewTransition>
            ) : (
              title
            )}
          </div>
          <p className="mt-4 text-lg text-white/85">{service.subtitle}</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{service.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {service.includes.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="relative z-20 mt-8 flex flex-wrap items-center gap-3">
            <span className="pointer-events-none inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#140d09] transition-transform duration-300 group-hover:translate-x-1">
              Entra nel servizio <span aria-hidden>→</span>
            </span>
            <button
              type="button"
              onClick={onPreview}
              className="rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-text hover:border-accent/60"
            >
              Anteprima
            </button>
          </div>
        </div>
        <div className="hidden h-44 rounded-2xl border border-white/10 bg-black/30 p-4 md:block">
          <Meter seed={index} />
        </div>
      </div>
    </article>
  );
}

/** Quick-view dialog driven by the transitions.dev modal open/close classes. */
function ServiceModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const [shown, setShown] = useState<Service | null>(null);
  const [phase, setPhase] = useState<"" | "is-open" | "is-closing">("");

  useEffect(() => {
    if (service) {
      setShown(service);
      setPhase("");
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("is-open")));
      getLenis()?.stop();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(id);
        getLenis()?.start();
        document.body.style.overflow = previous;
      };
    }
    if (!shown) return;
    setPhase("is-closing");
    const timer = setTimeout(() => setShown(null), 160);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [service, onClose]);

  if (!shown) return null;

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-[80] overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-md transition-opacity duration-200 ${
        phase === "is-open" ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Dettagli servizio ${shown.title}`}
    >
      <article
        onClick={(event) => event.stopPropagation()}
        className={`t-modal ${phase} surface mx-auto my-8 w-[min(760px,100%)] rounded-2xl border border-white/15 p-5 sm:rounded-3xl sm:p-7 md:my-14`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[var(--font-space)] text-3xl">{shown.title}</h3>
            <p className="mt-2 text-sm text-muted">{shown.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.12em] text-muted hover:border-accent/45 hover:text-text"
          >
            Chiudi
          </button>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted">{shown.detail}</p>

        <div className="mt-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Include</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {shown.includes.map((item) => (
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
          <JourneyLink
            href={shown.href}
            onClick={onClose}
            className="accent-hover rounded-full border border-accent bg-accent px-5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#140d09]"
          >
            Scopri il servizio →
          </JourneyLink>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="accent-hover rounded-full border border-accent bg-accent/10 px-5 py-2 text-xs uppercase tracking-[0.14em] text-accent"
          >
            Contattaci su WhatsApp
          </a>
        </div>
      </article>
    </div>
  );
}

export function HomeServices() {
  const [active, setActive] = useState<Service | null>(null);

  return (
    <section id="servizi" data-chapter="Servizi" className="py-16 md:py-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Servizi · 4 canali</p>
        <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
          Servizi pensati per farti capire subito da dove partire.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted md:text-base">
          Scorri: ogni canale entra nel mix sopra il precedente. Apri un servizio per entrare nella
          sua pagina, oppure guarda l&apos;anteprima rapida.
        </p>
      </Reveal>

      <div className="mt-10">
        <StackCards
          items={services.map((service, index) => (
            <ServiceCard
              key={service.code}
              service={service}
              index={index}
              onPreview={() => setActive(service)}
            />
          ))}
        />
      </div>

      <Reveal className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center sm:rounded-3xl sm:px-6 sm:py-6 md:flex-row md:text-left">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          Se non sai ancora quale servizio scegliere, scrivici su WhatsApp: ti indirizziamo verso
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
      </Reveal>

      <ServiceModal service={active} onClose={() => setActive(null)} />
    </section>
  );
}
