"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";
import { invalidateSlots, SlotPicker, type PickedSlot } from "@/components/slot-picker";
import {
  BOOKING_SERVICES,
  CAL_USERNAME,
  type BookingOption,
  type BookingSelection,
  type BookingService,
} from "@/lib/booking";

const NAMESPACE = "prenota";

/**
 * Service picker + our own slot calendar (free and booked times, booked ones
 * with a red dot). Picking a free time opens the Cal.com form on that exact
 * slot, where the client fills in details, pays and sends the request.
 */
export function BookingCalendar({ initial }: { initial: BookingSelection }) {
  const [{ service, option }, setSelection] = useState(initial);
  const [picked, setPicked] = useState<PickedSlot | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCalApi({ namespace: NAMESPACE }).then((cal) => {
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        layout: "month_view",
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          light: { "cal-brand": "#CD7948" },
          dark: { "cal-brand": "#CD7948", "cal-brand-text": "#140d09" },
        },
      });
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
          Scegli giorno e orario, paga online e invia la richiesta: lo slot resta bloccato per te e
          ricevi una email appena confermiamo la sessione.
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

        {picked ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="justify-self-start rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.14em] text-text transition-colors hover:translate-y-0 hover:border-accent hover:text-accent"
            >
              ← Cambia orario
            </button>
            <div className="surface min-h-[640px] overflow-hidden rounded-2xl p-1 sm:p-2">
              <Cal
                key={`${option.slug}-${picked.start}`}
                namespace={NAMESPACE}
                calLink={`${CAL_USERNAME}/${option.slug}`}
                config={{
                  layout: "month_view",
                  theme: "dark",
                  date: picked.date,
                  month: picked.date.slice(0, 7),
                  slot: new Date(picked.start).toISOString(),
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        ) : (
          <SlotPicker option={option} onPick={setPicked} refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}
