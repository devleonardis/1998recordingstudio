"use client";

import { FormEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format } from "date-fns";
import { PRICING, type PricingData } from "@studio/shared";
import { API_URL } from "@/lib/config";
import { BookingItemPayload, BookingPayload, ServiceCode } from "@/lib/types";

const ALL_SERVICE_CODES: ServiceCode[] = ["prod", "rec", "mixmaster", "noleggio"];

// Services shown as toggle-only (no user-selectable hour counter)
const TOGGLE_ONLY_SERVICES: ServiceCode[] = ["prod", "mixmaster"];

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

// Studio-hours contributed by each toggle-only service (used for slot-duration / availability fetch)
const STUDIO_HOURS_BOOST: Partial<Record<ServiceCode, number>> = {
  prod: 2,
  mixmaster: 2,
};

const SERVICE_DESCRIPTOR: Record<import("@/lib/types").ServiceCode, { label: string; withEngineer: boolean }> = {
  prod:      { label: "con fonico", withEngineer: true },
  rec:       { label: "con fonico", withEngineer: true },
  mixmaster: { label: "con fonico", withEngineer: true },
  noleggio:  { label: "sala libera · senza fonico", withEngineer: false },
};

const DAY_START_HOUR = 10;
const DAY_END_HOUR = 20;
const DAY_RANGE = DAY_END_HOUR - DAY_START_HOUR;

const steps = [
  { id: 1, label: "Pacchetto" },
  { id: 2, label: "Slot" },
  { id: 3, label: "Dati" },
] as const;

interface BookingWizardProps {
  onClose?: () => void;
  compact?: boolean;
}

type ServicePricingWithActive = PricingData["services"][ServiceCode] & {
  active?: boolean;
};

function normalizeApiError(detail: unknown): string {
  if (typeof detail === "string" && detail.trim().length > 0) return detail;

  if (Array.isArray(detail)) {
    const texts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
          return item.msg;
        }
        return "";
      })
      .filter(Boolean);

    if (texts.length > 0) return texts.join(" | ");
  }

  if (detail && typeof detail === "object" && "msg" in detail && typeof detail.msg === "string") {
    return detail.msg;
  }

  return "Errore durante la prenotazione.";
}

function parseLocalDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function computeEndTime(start: string, hours: number): string {
  const [h, m] = start.split(":").map(Number);
  const startMinutes = h * 60 + m;
  const endMinutes = startMinutes + hours * 60;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMin = endMinutes % 60;
  return `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
}

function getSummaryBadge(service: ServiceCode, hours: number): string {
  if (service === "prod") return "2h";
  if (service === "rec" || service === "noleggio") return `${hours}h`;
  return "✓"; // checkmark for flat services
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BookingWizard({ onClose, compact = false }: BookingWizardProps) {
  const [livePricing, setLivePricing] = useState<PricingData>(PRICING);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<ServiceCode[]>([]);
  const [hourMap, setHourMap] = useState<Record<ServiceCode, number>>({ prod: 1, rec: 1, mixmaster: 1, noleggio: 1 });
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate);
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ customer_name: "", phone: "", artist_name: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const date = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const minDate = useMemo(() => format(todayDate, "yyyy-MM-dd"), []);

  // Live pricing from admin API; falls back to static JSON
  useEffect(() => {
    fetch(`${API_URL}/pricing`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.services) setLivePricing(data as PricingData);
      })
      .catch(() => {});
  }, []);

  const services = useMemo<ServiceCode[]>(
    () =>
      ALL_SERVICE_CODES.filter((code) => {
        const config = livePricing.services[code] as ServicePricingWithActive | undefined;
        return config?.active !== false;
      }),
    [livePricing.services]
  );

  const packageItems = useMemo<BookingItemPayload[]>(() => {
    return selected.map((service) => ({
      service,
      hours: service === "rec" || service === "noleggio" ? hourMap[service] : 1,
    }));
  }, [hourMap, selected]);

  // Total slot duration used for availability queries
  const studioHours = useMemo(() => {
    const total = packageItems.reduce((sum, item) => {
      if (item.service === "rec" || item.service === "noleggio") return sum + item.hours;
      return sum + (STUDIO_HOURS_BOOST[item.service] ?? 0);
    }, 0);
    return total > 0 ? Math.min(total, 8) : 1;
  }, [packageItems]);

  // Toggle-only services are billed at their flat price regardless of their type in the JSON
  const estimatedPrice = useMemo(() => {
    return packageItems.reduce((sum, item) => {
      const cfg = livePricing.services[item.service];
      if (TOGGLE_ONLY_SERVICES.includes(item.service)) return sum + cfg.price;
      return sum + (cfg.type === "hourly" ? cfg.price * item.hours : cfg.price);
    }, 0);
  }, [livePricing.services, packageItems]);

  const hasService = selected.length > 0;
  const hasSlot = slot.trim().length > 0;
  const hasName = form.customer_name.trim().length > 0;
  const hasPhone = form.phone.trim().length > 0;
  const hasArtistName = form.artist_name.trim().length > 0;

  useEffect(() => {
    async function fetchAvailability() {
      setLoadingSlots(true);
      setSlot("");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      try {
        const params = new URLSearchParams({
          date,
          services: selected.join(","),
          studio_hours: String(studioHours),
        });
        const res = await fetch(`${API_URL}/availability?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch {
        clearTimeout(timeout);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (selected.length > 0) {
      fetchAvailability();
      return;
    }

    setSlots([]);
    setSlot("");
  }, [selected, date, studioHours]);

  function toggleService(service: ServiceCode) {
    setSelected((prev) => {
      if (prev.includes(service)) return prev.filter((s) => s !== service);
      return [...prev, service];
    });
  }

  function canGoToStep(targetStep: number): boolean {
    if (targetStep > 1 && !hasService) {
      setMessage("Seleziona almeno un servizio per continuare.");
      return false;
    }
    if (targetStep > 2 && !hasSlot) {
      setMessage("Seleziona uno slot orario per continuare.");
      return false;
    }
    return true;
  }

  function goToStep(targetStep: number) {
    if (!canGoToStep(targetStep)) return;
    setMessage("");
    setStep(targetStep);
  }

  function changeServiceHours(service: ServiceCode, delta: number) {
    setHourMap((prev) => {
      const next = Math.min(8, Math.max(1, (prev[service] ?? 1) + delta));
      return { ...prev, [service]: next };
    });
  }

  function setQuickDate(offsetDays: number) {
    setSelectedDate(addDays(todayDate, offsetDays));
  }

  function openNativeDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    input.focus();
    const withPicker = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") withPicker.showPicker();
  }

  function getSlotBarPosition(startTime: string): { left: string; width: string } {
    const [h, m] = startTime.split(":").map(Number);
    const startOffset = h + m / 60 - DAY_START_HOUR;
    const leftPct = (startOffset / DAY_RANGE) * 100;
    const widthPct = (studioHours / DAY_RANGE) * 100;
    return {
      left: `${Math.max(0, leftPct)}%`,
      width: `${Math.min(widthPct, 100 - Math.max(0, leftPct))}%`,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (packageItems.length === 0) {
      setMessage("Seleziona almeno un servizio per continuare.");
      return;
    }
    if (!slot) {
      setMessage("Seleziona uno slot disponibile.");
      return;
    }
    if (!hasName) {
      setMessage("Inserisci il tuo nome e cognome.");
      return;
    }
    if (!hasPhone) {
      setMessage("Inserisci il numero di telefono.");
      return;
    }
    if (!hasArtistName) {
      setMessage("Inserisci il nome artista.");
      return;
    }

    const payload: BookingPayload = {
      items: packageItems,
      date,
      start_time: slot,
      hours: studioHours,
      studio_hours: studioHours,
      customer_name: form.customer_name,
      phone: form.phone,
      artist_name: form.artist_name || undefined,
    };

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(normalizeApiError(data?.detail));
        return;
      }
      onClose?.();
    } catch {
      setMessage("API non raggiungibile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${compact ? "mt-4" : "mt-8"} grid gap-5 lg:grid-cols-[1.2fr_0.8fr]`}>
      <form onSubmit={onSubmit} className="surface rounded-3xl p-6">

        {/* ── Stepper ── */}
        <div className="mb-8 flex items-start">
          {steps.map((item, idx) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(item.id)}
                  disabled={(item.id === 2 && !hasService) || (item.id === 3 && !hasSlot)}
                  className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                      done
                        ? "border-accent bg-accent text-white"
                        : active
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-white/20 text-muted"
                    }`}
                  >
                    {done ? <CheckIcon /> : item.id}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                      active ? "text-accent" : done ? "text-text/80" : "text-muted/50"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`mt-4 h-px flex-1 mx-3 transition-colors duration-300 ${
                      step > item.id ? "bg-accent/45" : "bg-white/10"
                    }`}
                  />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* ── Step content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >

            {/* ── STEP 1: Pacchetto ── */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Date picker */}
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(9,13,26,0.92),rgba(6,10,18,0.75))] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.26)]">
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">Data sessione</p>
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                      {[
                        { label: "Oggi", offset: 0 },
                        { label: "Domani", offset: 1 },
                        { label: "+7", offset: 7 },
                      ].map(({ label, offset }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setQuickDate(offset)}
                          className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted hover:border-accent/50 hover:text-text"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      ref={dateInputRef}
                      type="date"
                      min={minDate}
                      value={date}
                      onClick={openNativeDatePicker}
                      onFocus={openNativeDatePicker}
                      onChange={(e) => {
                        const parsed = parseLocalDate(e.target.value);
                        if (parsed) setSelectedDate(parsed);
                      }}
                      className="booking-date-input block w-full min-w-0 max-w-full rounded-xl border border-white/20 bg-black/25 px-4 py-3 text-left text-sm"
                    />
                  </div>
                </div>

                {/* Service cards */}
                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service) => {
                    const cfg = livePricing.services[service];
                    const active = selected.includes(service);
                    const isToggleOnly = TOGGLE_ONLY_SERVICES.includes(service);

                    return (
                      <div
                        role="button"
                        tabIndex={0}
                        key={service}
                        onClick={() => toggleService(service)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleService(service);
                          }
                        }}
                        className={`relative cursor-pointer select-none rounded-xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(205,121,72,0.15)]"
                            : "border-white/15 hover:border-accent/40 hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Checkmark badge for selected toggle-only services */}
                        {active && isToggleOnly && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                            <CheckIcon />
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-2 pr-7">
                          <div>
                            <p className="font-medium">{cfg.label}</p>
                            <p className={`mt-0.5 text-[11px] ${SERVICE_DESCRIPTOR[service].withEngineer ? "text-muted/60" : "text-amber-500/70"}`}>
                              {SERVICE_DESCRIPTOR[service].label}
                            </p>
                          </div>
                          <span className={`text-xs ${active ? "text-accent" : "text-muted"}`}>
                            {isToggleOnly ? `${cfg.price} €` : `${cfg.price} €/h`}
                          </span>
                        </div>

                        {/* Hour counter for Rec only */}
                        {(service === "rec" || service === "noleggio") && active && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 flex items-center justify-between rounded-lg border border-white/20 bg-black/20 px-2 py-1.5"
                          >
                            <button
                              type="button"
                              onClick={() => changeServiceHours(service, -1)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-lg text-muted hover:border-accent/50 hover:text-text"
                              aria-label="Riduci ore"
                            >
                              &minus;
                            </button>
                            <div className="text-center">
                              <span className="text-lg font-semibold">{hourMap[service]}</span>
                              <span className="ml-1 text-xs text-muted">h</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => changeServiceHours(service, 1)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-lg text-muted hover:border-accent/50 hover:text-text"
                              aria-label="Aumenta ore"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Slot ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Day timeline overview */}
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-muted/70">
                    Panoramica &middot; {date}
                  </p>
                  <div className="relative h-9 overflow-hidden rounded-lg bg-white/5">
                    {Array.from({ length: DAY_RANGE + 1 }, (_, i) => i).map((i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-white/[0.07]"
                        style={{ left: `${(i / DAY_RANGE) * 100}%` }}
                      >
                        <span className="absolute left-1 top-0.5 text-[9px] leading-none text-muted/40">
                          {DAY_START_HOUR + i}
                        </span>
                      </div>
                    ))}
                    {slots.map((s) => {
                      const pos = getSlotBarPosition(s);
                      const isSelected = slot === s;
                      return (
                        <div
                          key={s}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSlot(s)}
                          onKeyDown={(e) => e.key === "Enter" && setSlot(s)}
                          title={`${s} → ${computeEndTime(s, studioHours)} · ${studioHours}h`}
                          className={`absolute top-1.5 h-6 cursor-pointer rounded transition-all duration-200 ${
                            isSelected
                              ? "bg-accent shadow-[0_0_8px_rgba(205,121,72,0.5)]"
                              : "bg-accent/25 hover:bg-accent/45"
                          }`}
                          style={{ left: pos.left, width: pos.width }}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-[9px] text-muted/40">
                    <span>{DAY_START_HOUR}:00</span>
                    <span>{DAY_END_HOUR}:00</span>
                  </div>
                </div>

                {/* Slot cards */}
                <div>
                  <p className="mb-3 text-sm text-muted">Seleziona uno slot</p>
                  {loadingSlots && (
                    <div className="flex items-center gap-2.5 text-sm text-muted">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
                      Caricamento disponibilit&agrave;...
                    </div>
                  )}
                  {!loadingSlots && slots.length === 0 && (
                    <p className="text-sm text-muted/70">Nessuno slot disponibile per questa data.</p>
                  )}
                  {!loadingSlots && slots.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {slots.map((s) => {
                        const end = computeEndTime(s, studioHours);
                        const isSelected = slot === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSlot(s)}
                            className={`rounded-xl border p-4 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-accent bg-accent/15 shadow-[0_0_0_1px_rgba(205,121,72,0.25)]"
                                : "border-white/15 hover:border-accent/40 hover:bg-white/[0.03]"
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold leading-tight ${
                                isSelected ? "text-accent" : "text-text"
                              }`}
                            >
                              {s} &rarr; {end}
                            </p>
                            <p className="mt-1 text-xs text-muted">{studioHours}h</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 3: Dati ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      Nome e cognome
                    </label>
                    <input
                      required
                      placeholder="Mario Rossi"
                      value={form.customer_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm placeholder:text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.14em] text-muted">
                      Numero di telefono
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+39 333 456 7890"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm placeholder:text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    Nome artista
                  </label>
                  <input
                    required
                    placeholder="Nome d'arte o progetto"
                    value={form.artist_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, artist_name: e.target.value }))}
                    className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm placeholder:text-muted/40 focus:border-accent/60 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        {step < 3 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 px-5 py-2 text-sm text-muted hover:text-text"
              >
                Chiudi
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-full border border-white/20 px-5 py-2 text-sm"
              >
                Indietro
              </button>
            )}
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              disabled={(step === 1 && !hasService) || (step === 2 && !hasSlot)}
              className="ml-auto rounded-full border border-accent bg-accent/10 px-6 py-2 text-sm font-medium text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Avanti &rarr;
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={submitting || !hasName || !hasPhone || !hasArtistName}
              className="w-full rounded-xl bg-accent py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#d06628] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Invio in corso..." : "INVIA RICHIESTA"}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-full border border-white/20 px-5 py-2 text-sm"
              >
                Indietro
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm text-muted hover:text-text"
                >
                  Chiudi
                </button>
              )}
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-muted">{message}</p>}
      </form>

      {/* ── Riepilogo ── */}
      <aside className={`surface h-fit rounded-3xl p-6 ${compact ? "hidden lg:block" : ""}`}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Riepilogo</p>

        {packageItems.length === 0 ? (
          <p className="mt-4 text-sm text-muted/50">Nessun servizio selezionato.</p>
        ) : (
          <div className="mt-3 text-sm">
            {packageItems.map((item, idx) => (
              <div
                key={item.service}
                className={`flex items-center justify-between py-2.5 ${
                  idx < packageItems.length - 1 ? "border-b border-white/[0.07]" : ""
                }`}
              >
                <span>{livePricing.services[item.service].label}</span>
                <span
                  className={`font-medium ${
                    item.service === "mixmaster"
                      ? "text-accent/70"
                      : "text-muted"
                  }`}
                >
                  {getSummaryBadge(item.service, item.hours)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>Data</span>
            <span className="text-text/80">{date}</span>
          </div>
          {slot && (
            <div className="flex items-center justify-between text-muted">
              <span>Slot</span>
              <span className="font-medium text-text/90">
                {slot} &rarr; {computeEndTime(slot, studioHours)}
              </span>
            </div>
          )}
          {slot && (
            <div className="flex items-center justify-between text-muted">
              <span>Durata</span>
              <span>{studioHours}h</span>
            </div>
          )}
        </div>

        <p className="mt-6 text-4xl font-semibold tracking-tight text-accent">
          {estimatedPrice > 0 ? `${estimatedPrice} EUR` : "—"}
        </p>
      </aside>
    </div>
  );
}
