"use client";

import { useEffect, useMemo, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { CAL_USERNAME, type BookingOption } from "@/lib/booking";

const TIME_ZONE = "Europe/Rome";
/** How far ahead the calendar looks (and learns the weekly opening hours from). */
const WINDOW_DAYS = 42;
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
/**
 * The studio works past midnight (09:00–01:00): starts before this time
 * belong to the previous night, so the day view runs 09:00 → 00:xx.
 */
const NIGHT_ENDS = "06:00";

/** A start time as Cal.com returns it, e.g. "2026-10-09T15:00:00.000+02:00". */
type SlotStart = string;
type FreeSlots = Record<string, SlotStart[]>;
type Status = "loading" | "ready" | "error";

export type PickedSlot = { start: SlotStart };

const cache = new Map<string, Promise<FreeSlots>>();

/** Current Rome wall-clock time as "YYYY-MM-DD HH:MM". */
function nowInRome() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

/** The studio day we're in: after midnight it's still last night's session. */
function studioToday() {
  const [date, time] = nowInRome().split(" ");
  return time < NIGHT_ENDS ? addDays(date, -1) : date;
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

const hhmm = (start: SlotStart) => start.slice(11, 16);

/** Late-night starts sort after the evening ones. */
const studioSortKey = (time: string) => (time < NIGHT_ENDS ? `1${time}` : `0${time}`);
const byStudioTime = (a: string, b: string) => studioSortKey(a).localeCompare(studioSortKey(b));

function endTime(time: string, minutes: number) {
  const total = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Free start times from Cal.com's public slots API (no key needed). */
function loadFreeSlots(slug: string, from: string): Promise<FreeSlots> {
  const key = `${slug}:${from}`;
  let request = cache.get(key);
  if (!request) {
    const params = new URLSearchParams({
      eventTypeSlug: slug,
      username: CAL_USERNAME,
      start: from,
      // One extra calendar day for the last night's after-midnight slots.
      end: addDays(from, WINDOW_DAYS),
      timeZone: TIME_ZONE,
    });
    request = fetch(`https://api.cal.com/v2/slots?${params}`, {
      headers: { "cal-api-version": "2024-09-04" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body: { data: Record<string, { start: SlotStart }[]> }) => {
        // Re-key by studio day: a 00:00 start on the 9th is the night of the 8th.
        const byDay: FreeSlots = {};
        for (const [date, slots] of Object.entries(body.data)) {
          for (const { start } of slots) {
            const day = hhmm(start) < NIGHT_ENDS ? addDays(date, -1) : date;
            (byDay[day] ??= []).push(start);
          }
        }
        return byDay;
      });
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }
  return request;
}

/**
 * Cal.com only reports free slots. The opening grid of each weekday is
 * learned from every free start seen in the window, so a time that is part
 * of the grid but missing on a given day is booked: that's the red dot.
 */
function weeklyGrid(free: FreeSlots) {
  const grid: Set<string>[] = Array.from({ length: 7 }, () => new Set());
  for (const [day, starts] of Object.entries(free)) {
    for (const start of starts) grid[weekday(day)].add(hhmm(start));
  }
  return grid.map((times) => [...times].sort(byStudioTime));
}

export function invalidateSlots() {
  cache.clear();
}

export function SlotPicker({
  option,
  onPick,
  refreshKey = 0,
}: {
  option: BookingOption;
  onPick: (slot: PickedSlot) => void;
  refreshKey?: number;
}) {
  const today = useMemo(studioToday, []);
  const [status, setStatus] = useState<Status>("loading");
  const [free, setFree] = useState<FreeSlots>({});
  const [weekStart, setWeekStart] = useState(today);
  const [day, setDay] = useState(today);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadFreeSlots(option.slug, today).then(
      (slots) => {
        if (cancelled) return;
        setFree(slots);
        setStatus("ready");
      },
      () => !cancelled && setStatus("error"),
    );
    return () => {
      cancelled = true;
    };
  }, [option.slug, today, refreshKey]);

  const grid = useMemo(() => weeklyGrid(free), [free]);

  /** Every slot of a studio day, free or booked; times already gone are dropped. */
  const slotsFor = (date: string) => {
    const freeTimes = new Map((free[date] ?? []).map((start) => [hhmm(start), start]));
    const now = nowInRome();
    return grid[weekday(date)]
      .filter((time) => `${time < NIGHT_ENDS ? addDays(date, 1) : date} ${time}` > now)
      .map((time) => ({ time, start: freeTimes.get(time) }));
  };

  function goToWeek(start: string) {
    setWeekStart(start);
    setDay(start < today ? today : start);
  }

  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const lastDay = addDays(today, WINDOW_DAYS - 1);
  const daySlots = slotsFor(day);
  const freeCount = daySlots.filter((s) => s.start).length;

  if (status === "error") {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-muted">
        Non riusciamo a caricare il calendario in questo momento. Riprova tra poco o scrivici su{" "}
        <a href="https://wa.me/393883739941" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          WhatsApp
        </a>
        .
      </p>
    );
  }

  return (
    <div className="surface rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
          {MONTHS[Number(weekStart.slice(5, 7)) - 1]} {weekStart.slice(0, 4)}
        </p>
        <div className="flex gap-2">
          <WeekButton label="Settimana precedente" disabled={weekStart <= today} onClick={() => goToWeek(addDays(weekStart, -7))}>
            ←
          </WeekButton>
          <WeekButton label="Settimana successiva" disabled={addDays(weekStart, 7) > lastDay} onClick={() => goToWeek(addDays(weekStart, 7))}>
            →
          </WeekButton>
        </div>
      </div>

      <div role="radiogroup" aria-label="Giorno" className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {week.map((date) => {
          const slots = status === "ready" ? slotsFor(date) : [];
          const hasFree = slots.some((s) => s.start);
          const full = status === "ready" && slots.length > 0 && !hasFree;
          const closed = status === "ready" && slots.length === 0;
          const selected = date === day;
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={date > lastDay}
              onClick={() => setDay(date)}
              className={`relative flex flex-col items-center rounded-xl border px-1 py-2 transition-colors hover:translate-y-0 disabled:opacity-30 sm:py-3 ${
                selected ? "border-accent bg-accent/15" : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{WEEKDAYS[weekday(date)]}</span>
              <span className={`mt-1 text-base sm:text-lg ${selected ? "text-accent" : closed ? "text-muted/60" : "text-text"}`}>
                {Number(date.slice(8))}
              </span>
              <span
                aria-hidden
                className={`mt-1 h-1.5 w-1.5 rounded-full ${full ? "bg-[#e5484d]" : hasFree ? "bg-accent" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text">
          {WEEKDAYS[weekday(day)]} {Number(day.slice(8))} {MONTHS[Number(day.slice(5, 7)) - 1]}
          {status === "ready" && daySlots.length > 0 && (
            <span className="ml-2 text-muted">
              · {freeCount} {freeCount === 1 ? "orario libero" : "orari liberi"}
            </span>
          )}
        </p>
      </div>

      <div className="mt-3 min-h-[180px]">
        {status === "loading" ? (
          <div className="flex h-[180px] items-center justify-center gap-3 text-sm text-muted">
            <ThinkingOrb state="composing" size={20} theme="dark" aria-label="Caricamento orari" />
            Carico gli orari…
          </div>
        ) : daySlots.length === 0 ? (
          <p className="flex h-[180px] items-center justify-center text-sm text-muted">
            {grid[weekday(day)].length === 0 ? "Studio chiuso in questo giorno." : "Nessun orario rimasto per oggi."}
          </p>
        ) : (
          <ul key={`${option.slug}-${day}`} className="slot-grid grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {daySlots.map(({ time, start }, i) => (
              <li key={time} style={{ animationDelay: `${i * 25}ms` }}>
                {start ? (
                  <button
                    type="button"
                    onClick={() => onPick({ start })}
                    className="group flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm transition-colors hover:translate-y-0 hover:border-accent hover:bg-accent/10"
                  >
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_rgba(205,121,72,0.8)]" />
                    <span className="tabular-nums text-text group-hover:text-accent">
                      {time} – {endTime(time, option.minutes)}
                    </span>
                  </button>
                ) : (
                  <div
                    aria-label={`${time} occupato`}
                    className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.01] px-3 py-3 text-sm"
                  >
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#e5484d] shadow-[0_0_10px_rgba(229,72,77,0.7)]" />
                    <span className="tabular-nums text-muted/60 line-through decoration-white/20">
                      {time} – {endTime(time, option.minutes)}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function WeekButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-sm transition-colors hover:translate-y-0 hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
