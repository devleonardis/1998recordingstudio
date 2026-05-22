"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, GOOGLE_CALENDAR_ID, GOOGLE_CALENDAR_TIMEZONE } from "@/lib/config";
import { BookingDialog } from "@/components/booking-dialog";

type Status = "PENDING" | "CONFIRMED" | "CANCELED";

interface AdminBooking {
  id: string;
  service: string;
  package_items?: Array<{ service: string; hours: number }>;
  date: string;
  start_time: string;
  hours: number;
  price_total: number;
  customer_name: string;
  engineer_name?: string;
  artist_name?: string;
  phone: string;
  status: Status;
}

function normalizeApiMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim().length > 0) return detail;
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
          return item.msg;
        }
        return "";
      })
      .filter(Boolean);
    if (msgs.length > 0) return msgs.join(" | ");
  }
  return fallback;
}

const ADMIN_FROM = "2020-01-01";
const ADMIN_TO = "2100-12-31";

type SortMode = "datetime_desc" | "datetime_asc" | "customer_asc" | "customer_desc" | "price_desc" | "price_asc";
type AdminView = "home" | "agenda" | "calendar" | "bookings" | "listino";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "datetime_desc", label: "Più recenti" },
  { value: "datetime_asc", label: "Più vecchie" },
  { value: "customer_asc", label: "Cliente A→Z" },
  { value: "customer_desc", label: "Cliente Z→A" },
  { value: "price_desc", label: "Prezzo ↓" },
  { value: "price_asc", label: "Prezzo ↑" },
];

interface CustomService {
  code: string;
  label: string;
  service_type: "fixed" | "hourly";
  price: number;
  currency: string;
  description: string;
  active: boolean;
  sort_order: number;
}

interface PricingService {
  code: string;
  label: string;
  type: string;
  price: number;
  base_price: number;
  currency: string;
  description: string;
  active: boolean;
}

function bookingSearchText(booking: AdminBooking): string {
  const services =
    booking.package_items?.map((item) => `${item.service} ${item.hours}`).join(" ") || booking.service;
  return [
    booking.customer_name,
    booking.artist_name || "",
    booking.engineer_name || "",
    booking.phone,
    booking.date,
    booking.start_time,
    booking.status,
    services,
  ]
    .join(" ")
    .toLowerCase();
}

function sortBookings(items: AdminBooking[], sortMode: SortMode): AdminBooking[] {
  const copy = [...items];
  copy.sort((a, b) => {
    const datetimeA = `${a.date}T${a.start_time}`;
    const datetimeB = `${b.date}T${b.start_time}`;
    switch (sortMode) {
      case "datetime_asc":
        return datetimeA.localeCompare(datetimeB);
      case "datetime_desc":
        return datetimeB.localeCompare(datetimeA);
      case "customer_asc":
        return a.customer_name.localeCompare(b.customer_name, "it");
      case "customer_desc":
        return b.customer_name.localeCompare(a.customer_name, "it");
      case "price_asc":
        return a.price_total - b.price_total;
      case "price_desc":
        return b.price_total - a.price_total;
      default:
        return 0;
    }
  });
  return copy;
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    PENDING: { label: "In attesa", cls: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
    CONFIRMED: { label: "Confermata", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
    CANCELED: { label: "Annullata", cls: "border-red-500/30 bg-red-500/10 text-red-400" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {label}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("admin@1998studio.it");
  const [password, setPassword] = useState("admin123");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("datetime_desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [showManaged, setShowManaged] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [pricingServices, setPricingServices] = useState<PricingService[]>([]);
  const [pricingEdits, setPricingEdits] = useState<Record<string, string>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [newService, setNewService] = useState({
    code: "",
    label: "",
    service_type: "fixed" as "fixed" | "hourly",
    price: "",
    description: "",
  });
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<AdminBooking[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [engineerChoice, setEngineerChoice] = useState<"NARDI" | "SVG" | "">("NARDI");
  const [openBooking, setOpenBooking] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("home");

  const calendarEmbedUrl = GOOGLE_CALENDAR_ID
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=${encodeURIComponent(GOOGLE_CALENDAR_TIMEZONE)}`
    : "";

  const today = new Date().toISOString().slice(0, 10);

  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "PENDING"), [bookings]);
  const managedBookings = useMemo(() => bookings.filter((b) => b.status !== "PENDING"), [bookings]);
  const sessionsTodayCount = useMemo(
    () => upcomingSessions.filter((b) => b.date === today).length,
    [upcomingSessions, today],
  );
  const agendaGroups = useMemo(
    () =>
      upcomingSessions.reduce<{ date: string; items: AdminBooking[] }[]>((groups, b) => {
        const last = groups[groups.length - 1];
        if (last && last.date === b.date) last.items.push(b);
        else groups.push({ date: b.date, items: [b] });
        return groups;
      }, []),
    [upcomingSessions],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const visiblePending = useMemo(() => {
    const filtered = pendingBookings.filter(
      (b) => !normalizedSearch || bookingSearchText(b).includes(normalizedSearch),
    );
    return sortBookings(filtered, sortMode);
  }, [pendingBookings, normalizedSearch, sortMode]);
  const visibleManaged = useMemo(() => {
    const filtered = managedBookings.filter(
      (b) => !normalizedSearch || bookingSearchText(b).includes(normalizedSearch),
    );
    return sortBookings(filtered, sortMode);
  }, [managedBookings, normalizedSearch, sortMode]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (stored) setToken(stored);
  }, []);

  function logout(reason?: string) {
    localStorage.removeItem("admin_token");
    setToken("");
    setBookings([]);
    setSelectedIds(new Set());
    if (reason) setMessage(reason);
    router.push("/");
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.detail || "Login fallito");
      return;
    }
    localStorage.setItem("admin_token", data.access_token);
    setToken(data.access_token);
  }

  const loadBookings = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/bookings?from=${ADMIN_FROM}&to=${ADMIN_TO}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        logout("Sessione scaduta, effettua di nuovo il login.");
        return;
      }
      setMessage(data.detail || "Errore caricamento");
      return;
    }
    setBookings(data.items ?? []);
    setSelectedIds(new Set());
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void loadBookings();
    void loadUpcoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBookings, token]);

  async function loadPricing() {
    if (!token) return;
    setPricingLoading(true);
    const res = await fetch(`${API_URL}/admin/pricing`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setPricingServices(data.services ?? []);
      const edits: Record<string, string> = {};
      for (const s of data.services ?? []) edits[s.code] = String(s.price);
      setPricingEdits(edits);
    }
    setPricingLoading(false);
  }

  async function savePricing(code: string) {
    setPricingMessage("");
    const newPrice = parseInt(pricingEdits[code] ?? "", 10);
    if (isNaN(newPrice) || newPrice < 0) {
      setPricingMessage("Prezzo non valido.");
      return;
    }
    const res = await fetch(`${API_URL}/admin/pricing/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ price: newPrice }),
    });
    if (res.ok) {
      setPricingMessage("Prezzo aggiornato.");
      await loadPricing();
    } else {
      setPricingMessage("Errore aggiornamento prezzo.");
    }
  }

  async function toggleActive(code: string, active: boolean) {
    setPricingMessage("");
    const res = await fetch(`${API_URL}/admin/pricing/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setPricingMessage(active ? "Servizio attivato." : "Servizio disattivato.");
      await loadPricing();
    } else {
      setPricingMessage("Errore aggiornamento stato.");
    }
  }

  async function resetPricing(code: string) {
    setPricingMessage("");
    const res = await fetch(`${API_URL}/admin/pricing/${code}/reset`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) {
      setPricingMessage("Prezzo ripristinato al default.");
      await loadPricing();
    }
  }

  async function loadUpcoming() {
    if (!token) return;
    setAgendaLoading(true);
    const res = await fetch(`${API_URL}/admin/bookings/upcoming?limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setUpcomingSessions(data.items ?? []);
    }
    setAgendaLoading(false);
  }

  async function syncCalendar(silent = false) {
    if (!token) return;
    if (!silent) setAgendaLoading(true);
    setSyncMessage("");
    const res = await fetch(`${API_URL}/admin/calendar/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.imported > 0) {
        setSyncMessage(
          `${data.imported} nuova${data.imported > 1 ? "e sessioni importate" : " sessione importata"} dal calendario.`,
        );
      } else if (!silent) {
        setSyncMessage("Nessun nuovo evento da importare.");
      }
      await loadUpcoming();
    } else if (!silent) {
      setSyncMessage("Errore durante la sincronizzazione.");
      setAgendaLoading(false);
    }
    if (!silent) setAgendaLoading(false);
  }

  async function loadCustomServices() {
    if (!token) return;
    const res = await fetch(`${API_URL}/admin/custom-services`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setCustomServices(data.items ?? []);
    }
  }

  async function createCustomService() {
    setPricingMessage("");
    const price = parseInt(newService.price, 10);
    if (!newService.code || !newService.label || isNaN(price) || price < 0) {
      setPricingMessage("Compila tutti i campi obbligatori correttamente.");
      return;
    }
    const res = await fetch(`${API_URL}/admin/custom-services`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: newService.code.toLowerCase().replace(/\s+/g, "_"),
        label: newService.label,
        service_type: newService.service_type,
        price,
        description: newService.description,
      }),
    });
    const data = await res.json();
    if (res.ok || res.status === 201) {
      setPricingMessage(`Servizio "${newService.label}" aggiunto.`);
      setNewService({ code: "", label: "", service_type: "fixed", price: "", description: "" });
      setShowNewServiceForm(false);
      await loadCustomServices();
      await loadPricing();
    } else {
      setPricingMessage(data.detail || "Errore creazione servizio.");
    }
  }

  async function deleteCustomService(code: string, label: string) {
    if (!confirm(`Eliminare definitivamente il servizio "${label}"?`)) return;
    setPricingMessage("");
    const res = await fetch(`${API_URL}/admin/custom-services/${code}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok || res.status === 204) {
      setPricingMessage("Servizio eliminato.");
      await loadCustomServices();
      await loadPricing();
    }
  }

  async function patchStatus(
    id: string,
    status: Status,
    silent = false,
    engineer_name?: string,
  ): Promise<boolean> {
    const body: Record<string, string> = { status };
    if (engineer_name !== undefined) body.engineer_name = engineer_name;
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      logout("Sessione scaduta, effettua di nuovo il login.");
      return false;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (!silent) setMessage(normalizeApiMessage(data?.detail, "Errore aggiornamento stato."));
      return false;
    }
    return true;
  }

  async function updateStatus(id: string, status: Status, engineer_name?: string) {
    const ok = await patchStatus(id, status, false, engineer_name);
    if (!ok) return;
    setMessage(status === "CONFIRMED" ? "Sessione confermata e aggiunta al calendario." : "Stato aggiornato.");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await loadBookings();
    if (status === "CONFIRMED") void loadUpcoming();
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectMany(ids: string[]) {
    setSelectedIds((prev) => new Set([...prev, ...ids]));
  }

  function unselectMany(ids: string[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  async function bulkUpdate(status: Status) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 || bulkLoading) return;
    setBulkLoading(true);
    let success = 0;
    let failed = 0;
    for (const id of ids) {
      const ok = await patchStatus(id, status, true);
      if (ok) success += 1;
      else failed += 1;
    }
    setBulkLoading(false);
    setMessage(
      `${success} aggiornate` +
        (status === "CONFIRMED" ? " e inviate al calendario." : ".") +
        (failed > 0 ? ` ${failed} non aggiornate.` : ""),
    );
    if (success > 0) {
      await loadBookings();
      if (status === "CONFIRMED") void loadUpcoming();
    }
  }

  function setView(view: AdminView) {
    setActiveView(view);
    if (view === "listino") {
      loadPricing();
      loadCustomServices();
    }
    if (view === "agenda" || view === "home") syncCalendar(true);
  }

  function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("it-IT", opts ?? { day: "numeric", month: "short" });
  }

  function renderSessionRow(b: AdminBooking) {
    return (
      <article
        key={b.id}
        className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
      >
        <div className="w-12 shrink-0 text-center">
          <p className="text-base font-bold tabular-nums">{b.start_time.slice(0, 5)}</p>
          <p className="text-[10px] text-muted">{b.hours}h</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{b.artist_name || b.customer_name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {b.package_items?.map((i) => i.service.toUpperCase()).join(" · ") || b.service.toUpperCase()}
            {b.engineer_name ? ` · ${b.engineer_name}` : ""}
          </p>
          {b.customer_name !== b.artist_name ? (
            <p className="text-xs text-muted">{b.customer_name}</p>
          ) : null}
        </div>
        <p className="text-sm font-semibold text-accent">{b.price_total} €</p>
      </article>
    );
  }

  function renderManagedRow(b: AdminBooking) {
    return (
      <article
        key={b.id}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.015] px-4 py-3"
      >
        <input
          type="checkbox"
          checked={selectedIds.has(b.id)}
          onChange={() => toggleSelected(b.id)}
          className="h-4 w-4 shrink-0 accent-accent"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{b.customer_name}</p>
          <p className="text-xs text-muted">
            {formatDate(b.date)} · {b.start_time.slice(0, 5)} ·{" "}
            {b.artist_name && b.artist_name !== b.customer_name ? b.artist_name : b.customer_name}
          </p>
        </div>
        <StatusBadge status={b.status} />
        <p className="shrink-0 text-xs font-semibold text-accent">{b.price_total} €</p>
      </article>
    );
  }

  function renderPendingCard(b: AdminBooking) {
    return (
      <article
        key={b.id}
        className="rounded-2xl border border-white/15 bg-white/[0.02] p-5 transition hover:border-accent/30"
      >
        <div className="flex items-start justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.has(b.id)}
              onChange={() => toggleSelected(b.id)}
              className="h-4 w-4 accent-accent"
            />
            <div>
              <p className="font-semibold">{b.customer_name}</p>
              {b.artist_name && b.artist_name !== b.customer_name ? (
                <p className="text-xs text-muted">Artista: {b.artist_name}</p>
              ) : null}
            </div>
          </label>
          <StatusBadge status={b.status} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Data</p>
            <p className="mt-0.5 text-sm">{formatDate(b.date)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Ora · Durata</p>
            <p className="mt-0.5 text-sm">
              {b.start_time.slice(0, 5)} · {b.hours}h
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Servizio</p>
            <p className="mt-0.5 truncate text-sm">
              {b.package_items?.map((i) => `${i.service}(${i.hours}h)`).join("+") || b.service}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Totale</p>
            <p className="mt-0.5 text-sm font-semibold text-accent">{b.price_total} €</p>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted">
          {b.phone} · #{b.id.slice(0, 8)}
        </p>

        {confirmingId !== b.id ? (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setConfirmingId(b.id);
                setEngineerChoice("NARDI");
              }}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              Accetta
            </button>
            <button
              onClick={() => updateStatus(b.id, "CANCELED")}
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:border-red-500/30 hover:text-red-400"
            >
              Rifiuta
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.15em] text-muted">Seleziona fonico</p>
            <div className="flex flex-wrap gap-2">
              {(["NARDI", "SVG", ""] as const).map((choice) => (
                <button
                  key={choice || "none"}
                  type="button"
                  onClick={() => setEngineerChoice(choice)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    engineerChoice === choice
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-white/20 text-muted hover:border-accent/40"
                  }`}
                >
                  {choice === "" ? "Nessuno" : choice}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  updateStatus(b.id, "CONFIRMED", engineerChoice || undefined);
                  setConfirmingId(null);
                }}
                className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
              >
                Conferma sessione
              </button>
              <button
                onClick={() => setConfirmingId(null)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:text-text"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }

  // ── LOGIN SCREEN ────────────────────────────────────────────────────
  if (!token) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="font-[var(--font-space)] text-5xl font-bold tracking-tight">1998</p>
            <p className="mt-1 text-xs uppercase tracking-[0.35em] text-muted">Studio Admin</p>
          </div>
          <div className="surface rounded-2xl p-8">
            <form onSubmit={login} className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-accent/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-muted">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-accent/60"
                />
              </div>
              <button className="mt-2 w-full rounded-full border border-accent bg-accent/10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent transition hover:bg-accent/20">
                Accedi
              </button>
            </form>
            {message ? <p className="mt-4 text-center text-sm text-red-400">{message}</p> : null}
          </div>
        </div>
      </main>
    );
  }

  // ── NAV ITEMS ───────────────────────────────────────────────────────
  const navItems: { view: AdminView; label: string }[] = [
    { view: "home", label: "Dashboard" },
    { view: "agenda", label: "Agenda" },
    { view: "calendar", label: "Calendario" },
    { view: "bookings", label: "Prenotazioni" },
    { view: "listino", label: "Listino prezzi" },
  ];

  // ── SIDEBAR ─────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 pb-4">
        <p className="font-[var(--font-space)] text-2xl font-bold tracking-tight">1998</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted">Studio Admin</p>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5">
        {navItems.map(({ view, label }) => {
          const isActive = activeView === view;
          return (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`flex w-full items-center justify-between rounded-lg border-l-2 px-3 py-2.5 text-sm transition ${
                isActive
                  ? "border-accent bg-accent/10 font-medium text-text"
                  : "border-transparent text-muted hover:bg-white/5 hover:text-text"
              }`}
            >
              <span>{label}</span>
              {view === "bookings" && pendingBookings.length > 0 ? (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {pendingBookings.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <button
          onClick={() => setOpenBooking(true)}
          className="w-full rounded-full border border-accent bg-accent/10 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent transition hover:bg-accent/20"
        >
          + Nuova sessione
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-center">
          <p
            className={`text-2xl font-bold tabular-nums ${pendingBookings.length > 0 ? "text-amber-400" : "text-text"}`}
          >
            {pendingBookings.length}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">In attesa</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-center">
          <p className="text-2xl font-bold tabular-nums text-text">{upcomingSessions.length}</p>
          <p className="mt-0.5 text-[10px] text-muted">Programmate</p>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <p className="mt-2 text-center text-xs text-muted">
          <span className="font-semibold text-accent">{selectedIds.size}</span> selezionate
        </p>
      ) : null}

      <button
        onClick={() => logout()}
        className="mt-3 w-full rounded-lg border border-white/10 py-2 text-xs text-muted transition hover:border-white/25 hover:text-text"
      >
        Logout
      </button>
    </div>
  );

  // ── BULK ACTION BAR ─────────────────────────────────────────────────
  const bulkBar =
    selectedIds.size > 0 ? (
      <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-text">{selectedIds.size}</span> selezionate
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => bulkUpdate("CONFIRMED")}
            disabled={bulkLoading}
            className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {bulkLoading ? "..." : "Conferma tutte"}
          </button>
          <button
            onClick={() => bulkUpdate("CANCELED")}
            disabled={bulkLoading}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
          >
            Rifiuta tutte
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:text-text"
          >
            Deseleziona
          </button>
        </div>
      </div>
    ) : null;

  // ── SEARCH TOOLBAR ──────────────────────────────────────────────────
  const searchToolbar = (
    <div className="surface rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca cliente, artista, telefono..."
          className="min-w-[200px] flex-1 rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
        />
        <div className="relative">
          {sortOpen && (
            <button
              type="button"
              aria-label="Chiudi ordinamento"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setSortOpen(false)}
              tabIndex={-1}
            />
          )}
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="relative z-50 flex items-center gap-2 rounded-xl border border-white/15 bg-[#0c1013] px-3 py-2.5 text-sm transition hover:border-white/30"
          >
            <span className="whitespace-nowrap">
              {sortOptions.find((o) => o.value === sortMode)?.label ?? "Ordina"}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3.5 w-3.5 transition-transform duration-150 ${sortOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] overflow-hidden rounded-xl border border-white/15 bg-[#0c1013] shadow-[0_8px_32px_rgba(0,0,0,0.55)]">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortMode(opt.value);
                    setSortOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${
                    sortMode === opt.value ? "font-medium text-accent" : "text-text"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={loadBookings}
          className="rounded-full border border-white/20 px-4 py-2.5 text-xs transition hover:border-white/40"
        >
          Aggiorna
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </div>
  );

  // ── VIEW TITLES ─────────────────────────────────────────────────────
  const viewTitles: Record<AdminView, string> = {
    home: "Dashboard",
    agenda: "Agenda",
    calendar: "Calendario",
    bookings: "Prenotazioni",
    listino: "Listino prezzi",
  };

  return (
    <main className="mx-0 w-full max-w-none px-4 pb-24 pt-0 md:px-6 md:pb-8 md:pt-8 xl:px-8">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 -mx-4 mb-5 flex items-center justify-between gap-2 border-b border-white/10 bg-bg/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="shrink-0">
          <p className="font-[var(--font-space)] text-base font-bold leading-none">1998</p>
          <p className="text-[9px] uppercase tracking-[0.22em] text-muted">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] text-muted transition hover:border-white/30 hover:text-text"
        >
          Esci
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="surface hidden h-fit rounded-2xl p-5 lg:sticky lg:top-20 lg:block">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <div className="min-w-0 space-y-5">
          {/* View header */}
          <div className="flex items-center gap-3">
            <h1 className="font-[var(--font-space)] text-xl font-bold">{viewTitles[activeView]}</h1>
            {activeView === "bookings" && pendingBookings.length > 0 ? (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                {pendingBookings.length} in attesa
              </span>
            ) : null}
          </div>

          {/* ── HOME DASHBOARD ─────────────────────────────────────────── */}
          {activeView === "home" ? (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="surface rounded-2xl p-3 sm:p-5">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted sm:text-[10px] sm:tracking-[0.2em]">Da gestire</p>
                  <p
                    className={`mt-1.5 font-[var(--font-space)] text-2xl font-bold tabular-nums sm:mt-2 sm:text-4xl ${pendingBookings.length > 0 ? "text-amber-400" : "text-text"}`}
                  >
                    {pendingBookings.length}
                  </p>
                  {pendingBookings.length > 0 ? (
                    <button
                      onClick={() => setView("bookings")}
                      className="mt-1.5 text-[10px] text-accent transition hover:underline sm:mt-2 sm:text-xs"
                    >
                      Gestisci →
                    </button>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-muted sm:mt-2 sm:text-xs">Tutto ok</p>
                  )}
                </div>
                <div className="surface rounded-2xl p-3 sm:p-5">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted sm:text-[10px] sm:tracking-[0.2em]">Oggi</p>
                  <p className="mt-1.5 font-[var(--font-space)] text-2xl font-bold tabular-nums text-text sm:mt-2 sm:text-4xl">
                    {sessionsTodayCount}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted sm:mt-2 sm:text-xs">
                    {sessionsTodayCount === 0 ? "Nessuna" : sessionsTodayCount === 1 ? "sessione" : "sessioni"}
                  </p>
                </div>
                <div className="surface rounded-2xl p-3 sm:p-5">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted sm:text-[10px] sm:tracking-[0.2em]">In agenda</p>
                  <p className="mt-1.5 font-[var(--font-space)] text-2xl font-bold tabular-nums text-text sm:mt-2 sm:text-4xl">
                    {upcomingSessions.length}
                  </p>
                  <button
                    onClick={() => setView("agenda")}
                    className="mt-1.5 text-[10px] text-accent transition hover:underline sm:mt-2 sm:text-xs"
                  >
                    Vedi →
                  </button>
                </div>
              </div>

              {/* Pending */}
              {visiblePending.length > 0 ? (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Richieste da gestire
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => selectMany(visiblePending.map((b) => b.id))}
                        className="text-xs text-muted transition hover:text-text"
                      >
                        Seleziona tutte
                      </button>
                      <button
                        onClick={() => setView("bookings")}
                        className="text-xs text-accent transition hover:underline"
                      >
                        Vedi tutte →
                      </button>
                    </div>
                  </div>
                  {bulkBar}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {visiblePending.slice(0, 4).map((b) => renderPendingCard(b))}
                  </div>
                </section>
              ) : null}

              {/* Upcoming sessions */}
              {agendaGroups.length > 0 ? (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em]">Prossime sessioni</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => syncCalendar(false)}
                        disabled={agendaLoading}
                        className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent transition disabled:opacity-50 hover:bg-accent/20"
                      >
                        {agendaLoading ? "Sync..." : "Sincronizza"}
                      </button>
                      <button
                        onClick={() => setView("agenda")}
                        className="text-xs text-accent transition hover:underline"
                      >
                        Agenda completa →
                      </button>
                    </div>
                  </div>
                  {syncMessage ? <p className="mb-3 text-xs text-muted">{syncMessage}</p> : null}
                  <div className="space-y-5">
                    {agendaGroups.slice(0, 3).map(({ date, items }) => (
                      <div key={date}>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                          {date === today
                            ? "Oggi"
                            : formatDate(date, { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <div className="space-y-2">{items.map((b) => renderSessionRow(b))}</div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Managed (collapsible) */}
              <section className="surface rounded-2xl p-5">
                <button
                  type="button"
                  onClick={() => setShowManaged((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">Già gestite</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{visibleManaged.length}</span>
                    <span className="text-xs text-muted">{showManaged ? "▾" : "▸"}</span>
                  </div>
                </button>
                {showManaged ? (
                  <div className="mt-4 space-y-2">
                    {visibleManaged.length === 0 ? (
                      <p className="text-sm text-muted">Nessuna.</p>
                    ) : (
                      visibleManaged.map((b) => renderManagedRow(b))
                    )}
                    {visibleManaged.length > 0 ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => selectMany(visibleManaged.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Seleziona visibili
                        </button>
                        <button
                          onClick={() => unselectMany(visibleManaged.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Deseleziona
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </>
          ) : null}

          {/* ── PRENOTAZIONI ─────────────────────────────────────────────── */}
          {activeView === "bookings" ? (
            <>
              {searchToolbar}
              {bulkBar}

              <section className="surface rounded-2xl p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-medium">Sessioni da accettare</h2>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                      {visiblePending.length}
                    </span>
                    {visiblePending.length > 0 ? (
                      <>
                        <button
                          onClick={() => selectMany(visiblePending.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Seleziona tutte
                        </button>
                        <button
                          onClick={() => unselectMany(visiblePending.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Deseleziona
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                {visiblePending.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-3xl">✓</p>
                    <p className="mt-2 text-sm text-muted">Nessuna richiesta in attesa</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {visiblePending.map((b) => renderPendingCard(b))}
                  </div>
                )}
              </section>

              <section className="surface rounded-2xl p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-medium">Già gestite</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{visibleManaged.length}</span>
                    {visibleManaged.length > 0 ? (
                      <>
                        <button
                          onClick={() => selectMany(visibleManaged.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Seleziona tutte
                        </button>
                        <button
                          onClick={() => unselectMany(visibleManaged.map((b) => b.id))}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:text-text"
                        >
                          Deseleziona
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                {visibleManaged.length === 0 ? (
                  <p className="text-sm text-muted">Nessuna prenotazione gestita.</p>
                ) : (
                  <div className="space-y-2">{visibleManaged.map((b) => renderManagedRow(b))}</div>
                )}
              </section>
            </>
          ) : null}

          {/* ── AGENDA ───────────────────────────────────────────────────── */}
          {activeView === "agenda" ? (
            <section className="surface rounded-2xl p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => syncCalendar(false)}
                    disabled={agendaLoading}
                    className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20 disabled:opacity-50"
                  >
                    {agendaLoading ? "Sincronizzazione..." : "Sincronizza calendario"}
                  </button>
                  <button
                    onClick={loadUpcoming}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:text-text"
                  >
                    Aggiorna
                  </button>
                </div>
              </div>
              {syncMessage ? <p className="mb-4 text-sm text-muted">{syncMessage}</p> : null}
              {agendaLoading ? (
                <p className="py-10 text-center text-sm text-muted">Caricamento...</p>
              ) : agendaGroups.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  Nessuna sessione confermata in programma.
                </p>
              ) : (
                <div className="space-y-6">
                  {agendaGroups.map(({ date, items }) => (
                    <div key={date}>
                      <div className="mb-3 flex items-center gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                          {date === today
                            ? "Oggi"
                            : formatDate(date, { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted">
                          {items.length}
                        </span>
                      </div>
                      <div className="space-y-2">{items.map((b) => renderSessionRow(b))}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {/* ── CALENDARIO ───────────────────────────────────────────────── */}
          {activeView === "calendar" ? (
            calendarEmbedUrl ? (
              <iframe
                title="Google Calendar Studio"
                src={calendarEmbedUrl}
                className="h-[460px] w-full rounded-2xl border border-white/10 bg-black/20 sm:h-[600px] md:h-[720px]"
                loading="lazy"
              />
            ) : (
              <p className="text-sm text-muted">Calendario non configurato nel frontend.</p>
            )
          ) : null}

          {/* ── LISTINO PREZZI ───────────────────────────────────────────── */}
          {activeView === "listino" ? (
            <div className="space-y-5">
              <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (
                        !confirm(
                          "Vuoi salvare i prezzi attuali come default? Questa operazione sovrascrive i valori base.",
                        )
                      )
                        return;
                      setPricingMessage("");
                      const res = await fetch(`${API_URL}/admin/pricing/save-defaults`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setPricingMessage("Prezzi salvati come default.");
                        await loadPricing();
                      } else {
                        setPricingMessage("Errore durante il salvataggio.");
                      }
                    }}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:border-accent/40 hover:text-text"
                  >
                    Salva come default
                  </button>
                  <button
                    onClick={loadPricing}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:text-text"
                  >
                    Aggiorna
                  </button>
                </div>
                {pricingMessage ? <p className="text-sm text-muted">{pricingMessage}</p> : null}
              </div>

              {pricingLoading ? (
                <p className="py-10 text-center text-sm text-muted">Caricamento...</p>
              ) : (
                <>
                  {/* Standard services */}
                  <section className="surface rounded-2xl p-5">
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                      Servizi standard
                    </p>
                    <div className="divide-y divide-white/8">
                      {pricingServices.map((s) => (
                        <div
                          key={s.code}
                          className={`py-5 first:pt-0 last:pb-0 transition ${!s.active ? "opacity-40" : ""}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{s.label}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {s.type === "hourly" ? "Tariffa oraria" : "Prezzo fisso"} · default{" "}
                                {s.base_price} €
                              </p>
                            </div>
                            <button
                              onClick={() => toggleActive(s.code, !s.active)}
                              className={`rounded-full border px-3 py-1 text-xs transition ${
                                s.active
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                  : "border-white/20 text-muted hover:border-emerald-500/30"
                              }`}
                            >
                              {s.active ? "Attivo" : "Disattivato"}
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={pricingEdits[s.code] ?? String(s.price)}
                                onChange={(e) =>
                                  setPricingEdits((prev) => ({ ...prev, [s.code]: e.target.value }))
                                }
                                className="w-28 rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent/50"
                              />
                              <span className="text-sm text-muted">€{s.type === "hourly" ? "/h" : ""}</span>
                            </div>
                            <button
                              onClick={() => savePricing(s.code)}
                              className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
                            >
                              Salva
                            </button>
                            {s.price !== s.base_price ? (
                              <button
                                onClick={() => resetPricing(s.code)}
                                className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted transition hover:text-text"
                              >
                                Ripristina ({s.base_price} €)
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Custom services */}
                  <section className="surface rounded-2xl p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                        Servizi aggiuntivi
                      </p>
                      <button
                        onClick={() => setShowNewServiceForm((v) => !v)}
                        className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
                      >
                        {showNewServiceForm ? "Annulla" : "+ Aggiungi"}
                      </button>
                    </div>

                    {showNewServiceForm ? (
                      <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 p-5">
                        <p className="mb-4 text-sm font-medium">Nuovo servizio</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs text-muted">Nome *</label>
                            <input
                              placeholder="es. Pack Promo"
                              value={newService.label}
                              onChange={(e) => setNewService((p) => ({ ...p, label: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent/50"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Codice interno *</label>
                            <input
                              placeholder="es. pack_promo"
                              value={newService.code}
                              onChange={(e) =>
                                setNewService((p) => ({
                                  ...p,
                                  code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                                }))
                              }
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-accent/50"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Tipo</label>
                            <div className="flex gap-2">
                              {(["fixed", "hourly"] as const).map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setNewService((p) => ({ ...p, service_type: type }))}
                                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                                    newService.service_type === type
                                      ? "border-accent bg-accent/15 font-medium text-accent"
                                      : "border-white/20 text-muted hover:border-accent/40 hover:text-text"
                                  }`}
                                >
                                  {type === "fixed" ? "Prezzo fisso" : "Tariffa oraria"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Prezzo (€) *</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={newService.price}
                              onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent/50"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-muted">Descrizione</label>
                            <input
                              placeholder="Breve descrizione del servizio"
                              value={newService.description}
                              onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent/50"
                            />
                          </div>
                        </div>
                        <button
                          onClick={createCustomService}
                          className="mt-4 rounded-full border border-accent bg-accent/10 px-5 py-2 text-xs font-medium text-accent transition hover:bg-accent/20"
                        >
                          Crea servizio
                        </button>
                      </div>
                    ) : null}

                    {customServices.length === 0 && !showNewServiceForm ? (
                      <p className="text-sm text-muted">Nessun servizio aggiuntivo.</p>
                    ) : null}

                    <div className="divide-y divide-white/8">
                      {customServices.map((s) => (
                        <div
                          key={s.code}
                          className={`py-5 first:pt-0 last:pb-0 transition ${!s.active ? "opacity-40" : ""}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{s.label}</p>
                              <p className="mt-0.5 font-mono text-xs text-muted">
                                {s.code} · {s.service_type === "hourly" ? "orario" : "fisso"}
                              </p>
                              {s.description ? (
                                <p className="mt-0.5 text-xs text-muted">{s.description}</p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleActive(s.code, !s.active)}
                                className={`rounded-full border px-3 py-1 text-xs transition ${
                                  s.active
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    : "border-white/20 text-muted hover:border-emerald-500/30"
                                }`}
                              >
                                {s.active ? "Attivo" : "Disattivato"}
                              </button>
                              <button
                                onClick={() => deleteCustomService(s.code, s.label)}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted transition hover:border-red-500/40 hover:text-red-400"
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={pricingEdits[s.code] ?? String(s.price)}
                                onChange={(e) =>
                                  setPricingEdits((prev) => ({ ...prev, [s.code]: e.target.value }))
                                }
                                className="w-28 rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-accent/50"
                              />
                              <span className="text-sm text-muted">€{s.service_type === "hourly" ? "/h" : ""}</span>
                            </div>
                            <button
                              onClick={async () => {
                                const price = parseInt(pricingEdits[s.code] ?? "", 10);
                                if (isNaN(price)) return;
                                await fetch(`${API_URL}/admin/custom-services/${s.code}`, {
                                  method: "PATCH",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ price }),
                                });
                                setPricingMessage("Prezzo aggiornato.");
                                await loadCustomServices();
                              }}
                              className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/20"
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile FAB — nuova sessione */}
      <button
        type="button"
        onClick={() => setOpenBooking(true)}
        aria-label="Nuova sessione"
        className="fixed bottom-[82px] right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-[0_4px_24px_rgba(205,121,72,0.5)] transition-all hover:scale-110 hover:shadow-[0_4px_32px_rgba(205,121,72,0.7)] active:scale-95 lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#140d09" strokeWidth={2.5} strokeLinecap="round" className="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Mobile bottom tab navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-bg/95 backdrop-blur-xl lg:hidden">
        <div className="flex">
          {(
            [
              { view: "home", label: "Home", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { view: "agenda", label: "Agenda", d: "M4 6h16M4 10h16M4 14h16M4 18h7" },
              { view: "calendar", label: "Cal.", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { view: "bookings", label: "Sessioni", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
              { view: "listino", label: "Prezzi", d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
            ] as { view: AdminView; label: string; d: string }[]
          ).map(({ view, label, d }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => setView(view)}
                className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[9px] uppercase tracking-[0.08em] transition active:scale-95 ${
                  isActive ? "text-accent" : "text-muted/60 hover:text-muted"
                }`}
              >
                {view === "bookings" && pendingBookings.length > 0 ? (
                  <span className="absolute right-1/2 top-2.5 h-1.5 w-1.5 translate-x-4 rounded-full bg-amber-400" />
                ) : null}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.2 : 1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d={d} />
                </svg>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <BookingDialog open={openBooking} onClose={() => setOpenBooking(false)} />
    </main>
  );
}
