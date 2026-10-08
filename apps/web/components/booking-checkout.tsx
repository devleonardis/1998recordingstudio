"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { LiquidMetal, MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef } from "react";
import {
  CAL_USERNAME,
  eventSlug,
  type BookingOption,
  type BookingService,
  type PaymentMode,
} from "@/lib/booking";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const TIME_ZONE = "Europe/Rome";
const NAMESPACE = "prenota";

/**
 * Look of the embedded Cal.com form. Cal only applies it to iframes that
 * already exist, so it is sent again every time the form mounts.
 */
export const CAL_UI = {
  theme: "dark",
  layout: "month_view",
  // Our ticket already shows the session: the embed is just the form.
  hideEventTypeDetails: true,
  cssVarsPerTheme: {
    light: { "cal-brand": "#D4853A" },
    dark: {
      "cal-brand": "#D4853A",
      "cal-brand-emphasis": "#E08B58",
      "cal-brand-text": "#140d09",
      // The booker panel is bg-muted + border-subtle: both go, so no card in a card.
      "cal-bg": "transparent",
      "cal-bg-muted": "transparent",
      "cal-bg-subtle": "rgba(255,255,255,0.05)",
      "cal-bg-emphasis": "rgba(255,255,255,0.08)",
      "cal-border": "rgba(255,255,255,0.12)",
      "cal-border-subtle": "transparent",
      "cal-border-booker": "transparent",
      "cal-text": "#E4E2DB",
      "cal-text-emphasis": "#FFFFFF",
      "cal-text-subtle": "#B8ABA2",
      "cal-text-muted": "#B8ABA2",
    },
  },
} as const;

const PAYMENT_MODES: { mode: PaymentMode; title: string; caption: string }[] = [
  { mode: "online", title: "Paga ora", caption: "Carta · Stripe, sicuro" },
  { mode: "studio", title: "Paga in studio", caption: "Contanti o carta il giorno della sessione" },
];

function formatSlot(start: string, minutes: number) {
  const from = new Date(start);
  const to = new Date(from.getTime() + minutes * 60_000);
  const day = new Intl.DateTimeFormat("it-IT", { timeZone: TIME_ZONE, weekday: "long", day: "numeric", month: "long" }).format(from);
  const time = (d: Date) => new Intl.DateTimeFormat("it-IT", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(d);
  return { day, range: `${time(from)} – ${time(to)}` };
}

/**
 * Step 03: the session ticket (our summary, payment choice, total) next to
 * the Cal.com form, embedded without its own card and event details so the
 * form reads as part of the page.
 */
export function BookingCheckout({
  service,
  option,
  start,
  mode,
  onModeChange,
  onBack,
}: {
  service: BookingService;
  option: BookingOption;
  start: string;
  mode: PaymentMode;
  onModeChange: (mode: PaymentMode) => void;
  onBack: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { day, range } = formatSlot(start, option.minutes);
  const ticketNo = `19.98—${start.slice(5, 10).replace("-", "")}${start.slice(11, 13)}`;
  const slug = eventSlug(option, mode);

  useEffect(() => {
    let cancelled = false;
    // Give the new iframe a moment to register before restyling it.
    const timer = setTimeout(() => {
      getCalApi({ namespace: NAMESPACE }).then((cal) => !cancelled && cal("ui", CAL_UI));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, start]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(q(".ticket"), { clipPath: "inset(0 0 100% 0 round 2rem)" }, { clipPath: "inset(0 0 0% 0 round 2rem)", duration: 1.1 })
        .fromTo(q(".ticket-disc"), { rotate: -120, scale: 0.6, autoAlpha: 0 }, { rotate: 0, scale: 1, autoAlpha: 1, duration: 1.2 }, 0.2)
        .fromTo(q(".ticket-row"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.8 }, 0.35)
        .fromTo(q(".checkout-form"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.45);
    },
    { scope: root },
  );

  // The total re-scrambles whenever the payment mode flips, like a display re-latching.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(".ticket-total", { duration: 0.7, scrambleText: { text: `${option.price} €`, chars: "0123456789€", speed: 0.6 } });
    },
    { scope: root, dependencies: [mode, option.price] },
  );

  return (
    <div ref={root} className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,540px)] lg:justify-center lg:gap-14">
      <aside className="ticket relative self-start overflow-hidden rounded-[2rem] border border-white/10">
        <MeshGradient
          className="pointer-events-none !absolute inset-0"
          colors={["#07090b", "#1d1b3a", "#d4853a", "#262952", "#090d18"]}
          distortion={0.8}
          swirl={0.3}
          grainOverlay={0.35}
          speed={0.18}
          maxPixelCount={260_000}
          minPixelRatio={1}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,11,0.55),rgba(7,9,11,0.9)_55%)]" />

        <div className="relative p-6 sm:p-7">
          <div className="ticket-row flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span>Session ticket</span>
            <span>{ticketNo}</span>
          </div>

          <div className="ticket-row mt-6 flex items-center gap-4">
            <div className="ticket-disc relative h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-[0_0_40px_rgba(212,133,58,0.35)]">
              <LiquidMetal
                className="!absolute inset-0"
                colorBack="#d4853a"
                colorTint="#ffe6cc"
                shape="circle"
                repetition={4}
                softness={0.45}
                distortion={0.12}
                contour={0.4}
                speed={0.6}
                maxPixelCount={60_000}
                minPixelRatio={1}
              />
              <span aria-hidden className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{service.code} · {option.label}</p>
              <h3 className="mt-1 font-[var(--font-space)] text-2xl leading-tight text-white">{service.title}</h3>
            </div>
          </div>

          <dl className="mt-7 grid gap-3 text-sm">
            {[
              ["Giorno", day],
              ["Orario", range],
              ["Luogo", "Via U. Minervini 25, Bari"],
            ].map(([label, value]) => (
              <div key={label} className="ticket-row flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</dt>
                <dd className="text-right capitalize text-text">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Perforation: the ticket tears here */}
          <div aria-hidden className="ticket-row relative -mx-6 my-7 sm:-mx-7">
            <div className="border-t border-dashed border-white/20" />
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-bg" />
          </div>

          <p className="ticket-row font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Pagamento</p>
          <div role="radiogroup" aria-label="Metodo di pagamento" className="ticket-row mt-3 grid gap-2">
            {PAYMENT_MODES.map((p) => {
              const selected = p.mode === mode;
              return (
                <button
                  key={p.mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onModeChange(p.mode)}
                  className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors hover:translate-y-0 ${
                    selected ? "border-accent/70 bg-accent/10" : "border-white/10 bg-black/20 hover:border-white/25"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-accent" : "border-white/30"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full bg-accent transition-transform ${selected ? "scale-100" : "scale-0"}`} />
                  </span>
                  <span>
                    <span className={`block text-sm ${selected ? "text-white" : "text-text"}`}>{p.title}</span>
                    <span className="block text-xs text-muted">{p.caption}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="ticket-row mt-7 flex items-end justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Totale{mode === "studio" ? " · in studio" : ""}
            </span>
            <span className="ticket-total font-[var(--font-space)] text-4xl tabular-nums text-white">{option.price} €</span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="ticket-row mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:translate-y-0 hover:text-accent"
          >
            ← Cambia orario
          </button>
        </div>
      </aside>

      <section className="checkout-form min-w-0">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">03 — I tuoi dati</p>
        <p className="mb-4 text-sm text-muted">
          {mode === "online"
            ? "Inserisci i tuoi dati e paga con carta: lo slot resta bloccato e ti confermiamo la sessione via email."
            : "Inserisci i tuoi dati e invia la richiesta: paghi in studio il giorno della sessione."}
        </p>
        <div className="-mx-2 min-h-[560px] sm:-mx-4">
          <Cal
            key={`${slug}-${start}`}
            namespace={NAMESPACE}
            calLink={`${CAL_USERNAME}/${slug}`}
            config={{
              layout: "month_view",
              theme: "dark",
              // Calendar date of the start (a 00:00 slot is the next day).
              date: start.slice(0, 10),
              month: start.slice(0, 7),
              slot: new Date(start).toISOString(),
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </section>
    </div>
  );
}
