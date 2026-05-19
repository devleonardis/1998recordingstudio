"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format } from "date-fns";
import { PRICING, type PricingData } from "@studio/shared";
import { API_URL } from "@/lib/config";
import { BookingItemPayload, BookingPayload, ServiceCode } from "@/lib/types";

const ALL_SERVICE_CODES: ServiceCode[] = ["prod", "rec", "mixmaster", "noleggio"];
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
const STUDIO_HOURS_BOOST: Partial<Record<ServiceCode, number>> = {
  prod: 3,
  mixmaster: 2,
};

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

function formatSlotRange(start: string, hours: number): string {
  const [h, m] = start.split(":").map(Number);
  const startMinutes = h * 60 + m;
  const endMinutes = startMinutes + hours * 60;
  const endHour = Math.floor(endMinutes / 60) % 24;
  const endMin = endMinutes % 60;
  const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
  return `${start}/${end}`;
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
  const [form, setForm] = useState({ customer_name: "", artist_name: "", phone: "", notes: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const date = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const minDate = useMemo(() => format(todayDate, "yyyy-MM-dd"), []);

  // Prezzi live dall'API (aggiornati dall'admin); fallback al JSON statico
  useEffect(() => {
    fetch(`${API_URL}/pricing`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.services) setLivePricing(data as PricingData);
      })
      .catch(() => {});
  }, []);

  // Servizi attivi secondo il listino admin
  const services = useMemo<ServiceCode[]>(
    () =>
      ALL_SERVICE_CODES.filter((code) => {
        const config = livePricing.services[code] as ServicePricingWithActive | undefined;
        return config?.active !== false;
      }),
    [livePricing.services]
  );

  const packageItems = useMemo<BookingItemPayload[]>(() => {
    return selected.map((service) => ({ service, hours: livePricing.services[service].type === "hourly" ? hourMap[service] : 1 }));
  }, [hourMap, livePricing.services, selected]);

  const studioHours = useMemo(() => {
    const total = packageItems.reduce((sum, item) => {
      if (item.service === "rec" || item.service === "noleggio") {
        return sum + item.hours;
      }
      return sum + (STUDIO_HOURS_BOOST[item.service] ?? 0);
    }, 0);
    return total > 0 ? Math.min(total, 8) : 1;
  }, [packageItems]);

  const estimatedPrice = useMemo(() => {
    return packageItems.reduce((sum, item) => {
      const cfg = livePricing.services[item.service];
      return sum + (cfg.type === "hourly" ? cfg.price * item.hours : cfg.price);
    }, 0);
  }, [livePricing.services, packageItems]);
  const hasService = selected.length > 0;
  const hasSlot = slot.trim().length > 0;
  const hasArtist = form.artist_name.trim().length > 0;
  const hasPhone = form.phone.trim().length > 0;

  function getRequiredStudioHoursForItem(item: BookingItemPayload): number {
    if (item.service === "rec" || item.service === "noleggio") return item.hours;
    return STUDIO_HOURS_BOOST[item.service] ?? 0;
  }

  useEffect(() => {
    async function fetchAvailability() {
      setLoadingSlots(true);
      setSlot("");
      try {
        const params = new URLSearchParams({
          date,
          services: selected.join(","),
          studio_hours: String(studioHours),
        });
        const res = await fetch(`${API_URL}/availability?${params.toString()}`, { cache: "no-store" });
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch {
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
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      }
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
    const next = addDays(todayDate, offsetDays);
    setSelectedDate(next);
  }

  function openNativeDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    input.focus();
    const withPicker = input as HTMLInputElement & { showPicker?: () => void };
    if (typeof withPicker.showPicker === "function") {
      withPicker.showPicker();
    }
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
    if (!hasArtist) {
      setMessage("Inserisci il nome artista.");
      return;
    }
    if (!hasPhone) {
      setMessage("Inserisci il numero di telefono.");
      return;
    }

    const payload: BookingPayload = {
      items: packageItems,
      date,
      start_time: slot,
      hours: studioHours,
      studio_hours: studioHours,
      customer_name: form.customer_name,
      artist_name: form.artist_name,
      phone: form.phone,
      notes: form.notes,
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
      setMessage(`Richiesta inviata. ID prenotazione: ${data.id}`);
      setStep(1);
      setSlot("");
      setForm({ customer_name: "", artist_name: "", phone: "", notes: "" });
    } catch {
      setMessage("API non raggiungibile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${compact ? "mt-4" : "mt-8"} grid gap-5 lg:grid-cols-[1.2fr_0.8fr]`}>
      <form onSubmit={onSubmit} className="surface rounded-3xl p-6">
        <div className="mb-7 flex items-center gap-2">
          {steps.map((item) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToStep(item.id)}
                disabled={(item.id === 2 && !hasService) || (item.id === 3 && !hasSlot)}
                className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : done
                      ? "border-accent/50 text-text"
                      : "border-white/15 text-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {step === 1 ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/15 bg-[linear-gradient(180deg,rgba(9,13,26,0.92),rgba(6,10,18,0.75))] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.26)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium">Data sessione</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickDate(0)}
                        className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted hover:border-accent/50 hover:text-text"
                      >
                        Oggi
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(1)}
                        className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted hover:border-accent/50 hover:text-text"
                      >
                        Domani
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(7)}
                        className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-muted hover:border-accent/50 hover:text-text"
                      >
                        +7
                      </button>
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
                      onChange={(event) => {
                        const parsed = parseLocalDate(event.target.value);
                        if (parsed) setSelectedDate(parsed);
                      }}
                      className="w-full rounded-xl border border-white/20 bg-black/25 px-4 py-3 text-sm"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {services.map((service) => {
                    const cfg = livePricing.services[service];
                    const active = selected.includes(service);
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
                        className={`rounded-xl border p-4 text-left transition ${active ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/40 hover:bg-white/[0.02]"}`}
                      >
                        <p className="font-medium">{cfg.label}</p>
                        {cfg.type === "hourly" && active ? (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 flex items-center justify-between rounded-lg border border-white/20 bg-black/20 px-2 py-2"
                          >
                            <button
                              type="button"
                              onClick={() => changeServiceHours(service, -1)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-lg text-muted hover:border-accent/50 hover:text-text"
                              aria-label={`Riduci ore ${cfg.label}`}
                            >
                              -
                            </button>
                            <span className="min-w-14 text-center text-lg font-semibold">{hourMap[service]}</span>
                            <button
                              type="button"
                              onClick={() => changeServiceHours(service, 1)}
                              className="grid h-9 w-9 place-items-center rounded-md border border-white/20 text-lg text-muted hover:border-accent/50 hover:text-text"
                              aria-label={`Aumenta ore ${cfg.label}`}
                            >
                              +
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <p className="text-sm text-muted">Seleziona uno slot</p>
                <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
                  {loadingSlots ? <p className="text-sm text-muted">Caricamento...</p> : null}
                  {!loadingSlots && slots.length === 0 ? <p className="text-sm text-muted">Nessuno slot libero.</p> : null}
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`rounded-lg border p-2 text-sm transition ${slot === s ? "border-accent bg-accent/15" : "border-white/15 hover:border-accent/40"}`}
                    >
                      {formatSlotRange(s, studioHours)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <input required placeholder="Nome e cognome" value={form.customer_name} onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))} className="rounded-xl border border-white/15 bg-transparent p-3" />
                <input required placeholder="Nome artista" value={form.artist_name} onChange={(e) => setForm((prev) => ({ ...prev, artist_name: e.target.value }))} className="rounded-xl border border-white/15 bg-transparent p-3" />
                <input required placeholder="Telefono" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="rounded-xl border border-white/15 bg-transparent p-3" />
                <input placeholder="Note" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="rounded-xl border border-white/15 bg-transparent p-3" />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap gap-3">
          {onClose ? (
            <button type="button" onClick={onClose} className="rounded-full border border-white/20 px-5 py-2 text-sm text-muted hover:text-text">
              Chiudi
            </button>
          ) : null}
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-full border border-white/20 px-5 py-2 text-sm">
              Indietro
            </button>
          ) : null}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => goToStep(step + 1)}
              disabled={(step === 1 && !hasService) || (step === 2 && !hasSlot)}
              className="rounded-full border border-accent bg-accent/10 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Avanti
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="rounded-full border border-accent bg-accent/10 px-6 py-2 text-sm disabled:opacity-50">
              {submitting ? "Invio..." : "INVIA RICHIESTA"}
            </button>
          )}
        </div>

        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
      </form>

      <aside className={`surface h-fit rounded-3xl p-6 ${compact ? "hidden lg:block" : ""}`}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Riepilogo</p>
        <div className="mt-3 space-y-2 text-sm">
          {packageItems.map((item) => (
            <p key={item.service} className="flex items-center justify-between">
              <span>{livePricing.services[item.service].label}</span>
              <span className="text-muted">{getRequiredStudioHoursForItem(item)}h</span>
            </p>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Data: {date}</p>
        <p className="mt-1 text-sm text-muted">Slot: {slot || "-"}</p>
        <p className="mt-1 text-sm text-muted">Durata: {studioHours}h</p>
        <p className="mt-5 text-3xl font-semibold text-accent">{estimatedPrice} EUR</p>
      </aside>
    </div>
  );
}
