"use client";

import { getCalApi } from "@calcom/embed-react";
import { useEffect, useRef, useState } from "react";
import { BookingCheckout, CAL_UI } from "@/components/booking-checkout";
import { getLenis } from "@/components/fx/smooth-scroll";
import { invalidateSlots, SlotPicker, type PickedSlot } from "@/components/slot-picker";
import {
  BOOKING_SERVICES,
  type BookingOption,
  type BookingSelection,
  type BookingService,
  type PaymentMode,
} from "@/lib/booking";

const NAMESPACE = "prenota";

const STEPS = ["Servizio", "Orario", "Conferma"];

/** 01 → 03 progress rail, like a playhead moving along the track. */
function StepRail({ step }: { step: number }) {
  return (
    <ol className="relative mb-8 grid grid-cols-3" aria-label="Passaggi della prenotazione">
      <span aria-hidden className="absolute left-0 right-0 top-[7px] h-px bg-white/10" />
      <span
        aria-hidden
        className="absolute left-0 top-[7px] h-px bg-accent shadow-[0_0_12px_rgba(205,121,72,0.8)] transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "active" : "next";
        return (
          <li
            key={label}
            aria-current={state === "active" ? "step" : undefined}
            className={`relative flex flex-col ${i === 0 ? "items-start" : i === STEPS.length - 1 ? "items-end" : "items-center"}`}
          >
            <span
              aria-hidden
              className={`h-[15px] w-[15px] rounded-full border transition-colors duration-500 ${
                state === "next" ? "border-white/20 bg-bg" : "border-accent bg-accent"
              } ${state === "active" ? "shadow-[0_0_0_5px_rgba(205,121,72,0.18)]" : ""}`}
            />
            <span
              className={`mt-3 font-mono text-[10px] uppercase tracking-[0.2em] ${
                state === "next" ? "text-muted/60" : state === "active" ? "text-accent" : "text-text"
              }`}
            >
              0{n} — {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Service picker + our own slot calendar (free and booked times, booked ones
 * with a red dot). Picking a free time turns the page into the session
 * ticket + Cal.com form, where the client chooses to pay now or at the studio.
 */
export function BookingCalendar({ initial }: { initial: BookingSelection }) {
  const [{ service, option }, setSelection] = useState(initial);
  const [picked, setPicked] = useState<PickedSlot | null>(null);
  const [mode, setMode] = useState<PaymentMode>("online");
  const [refreshKey, setRefreshKey] = useState(0);
  const top = useRef<HTMLDivElement>(null);

  function goToStep(slot: PickedSlot | null) {
    setPicked(slot);
    const el = top.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(el, { offset: -110 });
      else el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    let cancelled = false;
    getCalApi({ namespace: NAMESPACE }).then((cal) => {
      if (cancelled) return;
      cal("ui", CAL_UI);
      // A new booking takes its slot: the grid must show it red next time.
      cal("on", {
        action: "bookingSuccessful",
        callback: () => {
          invalidateSlots();
          setRefreshKey((k) => k + 1);
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function select(nextService: BookingService, nextOption: BookingOption = nextService.options[0]) {
    setSelection({ service: nextService, option: nextOption });
    setPicked(null);
    const param = nextService.options.length > 1 ? nextOption.slug : nextService.id;
    window.history.replaceState(null, "", `?servizio=${param}`);
  }

  return (
    <div ref={top}>
      <StepRail step={picked ? 3 : 2} />
      {picked ? (
        <BookingCheckout
          service={service}
          option={option}
          start={picked.start}
          mode={mode}
          onModeChange={setMode}
          onBack={() => goToStep(null)}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          <div role="radiogroup" aria-label="Servizio da prenotare" className="grid grid-cols-2 gap-2 lg:sticky lg:top-28 lg:grid-cols-1">
            {BOOKING_SERVICES.map((s) => {
              const selected = s.id === service.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => select(s)}
                  className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left sm:gap-4 sm:px-4 sm:py-4 transition-colors hover:translate-y-0 ${
                    selected
                      ? "border-accent/60 bg-accent/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tracking-[0.12em] sm:flex ${
                      selected ? "menu-disc border-accent text-transparent" : "border-white/15 text-muted"
                    }`}
                  >
                    {s.code}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-xs uppercase tracking-[0.12em] sm:text-sm sm:tracking-[0.14em] ${selected ? "text-accent" : "text-text"}`}>
                      {s.title}
                    </span>
                    <span className="mt-1 hidden text-xs leading-5 text-muted sm:block">{s.caption}</span>
                  </span>
                </button>
              );
            })}
            <p className="col-span-2 mt-2 px-1 text-xs leading-5 text-muted lg:col-span-1">
              Scegli giorno e orario: all'ultimo passo decidi se pagare subito online o in studio.
              Ricevi una email appena confermiamo la sessione.
            </p>
          </div>

          <div className="grid gap-3">
            {service.options.length > 1 && (
              <div>
                <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Durata</p>
                <div
                  role="radiogroup"
                  aria-label="Durata"
                  className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1"
                  style={{ gridTemplateColumns: `repeat(${service.options.length}, minmax(0, 1fr))` }}
                >
                  {service.options.map((o) => {
                    const selected = o.slug === option.slug;
                    return (
                      <button
                        key={o.slug}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => select(service, o)}
                        className={`flex flex-col items-center rounded-xl px-1 py-2 transition-colors hover:translate-y-0 sm:py-2.5 ${
                          selected ? "bg-accent text-[#140d09]" : "text-text hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-sm font-medium sm:text-base">{o.label}</span>
                        <span className={`text-[11px] tabular-nums ${selected ? "text-[#140d09]/75" : "text-muted"}`}>
                          {o.price} €
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <SlotPicker option={option} onPick={goToStep} refreshKey={refreshKey} />
          </div>
        </div>
      )}
    </div>
  );
}
