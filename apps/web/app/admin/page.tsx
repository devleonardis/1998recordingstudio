"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
type AdminView = "home" | "calendar" | "bookings" | "tools" | "listino" | "agenda";

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
  const services = booking.package_items?.map((item) => `${item.service} ${item.hours}`).join(" ") || booking.service;
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

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("admin@1998studio.it");
  const [password, setPassword] = useState("admin123");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("datetime_desc");
  const [showPending, setShowPending] = useState(true);
  const [showManaged, setShowManaged] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [pricingServices, setPricingServices] = useState<PricingService[]>([]);
  const [pricingEdits, setPricingEdits] = useState<Record<string, string>>({});
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingMessage, setPricingMessage] = useState("");
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [newService, setNewService] = useState({ code: "", label: "", service_type: "fixed" as "fixed" | "hourly", price: "", description: "" });
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<AdminBooking[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [engineerChoice, setEngineerChoice] = useState<"NARDI" | "SVG" | "">( "NARDI");
  const [openBooking, setOpenBooking] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const calendarEmbedUrl = GOOGLE_CALENDAR_ID
    ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(GOOGLE_CALENDAR_ID)}&ctz=${encodeURIComponent(
        GOOGLE_CALENDAR_TIMEZONE
      )}`
    : "";
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === "PENDING"), [bookings]);
  const managedBookings = useMemo(() => bookings.filter((b) => b.status !== "PENDING"), [bookings]);
  const normalizedSearch = search.trim().toLowerCase();
  const visiblePending = useMemo(() => {
    const filtered = pendingBookings.filter((b) => !normalizedSearch || bookingSearchText(b).includes(normalizedSearch));
    return sortBookings(filtered, sortMode);
  }, [pendingBookings, normalizedSearch, sortMode]);
  const visibleManaged = useMemo(() => {
    const filtered = managedBookings.filter((b) => !normalizedSearch || bookingSearchText(b).includes(normalizedSearch));
    return sortBookings(filtered, sortMode);
  }, [managedBookings, normalizedSearch, sortMode]);
  const collapsibleSections = activeView === "home";
  const pendingSectionOpen = collapsibleSections ? showPending : true;
  const managedSectionOpen = collapsibleSections ? showManaged : true;

  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadBookings();
  }, [token]);

  function logout(reason?: string) {
    localStorage.removeItem("admin_token");
    setToken("");
    setBookings([]);
    setSelectedIds(new Set());
    if (reason) setMessage(reason);
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
    setMessage("Login effettuato");
  }

  async function loadBookings() {
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
  }

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
      for (const s of data.services ?? []) {
        edits[s.code] = String(s.price);
      }
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
        setSyncMessage(`${data.imported} nuova${data.imported > 1 ? "e sessioni importate" : " sessione importata"} dal calendario.`);
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
      setPricingMessage(`Servizio eliminato.`);
      await loadCustomServices();
      await loadPricing();
    }
  }

  async function patchStatus(id: string, status: Status, silent = false, engineer_name?: string): Promise<boolean> {
    const body: Record<string, string> = { status };
    if (engineer_name !== undefined) body.engineer_name = engineer_name;
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      logout("Sessione scaduta, effettua di nuovo il login.");
      return false;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (!silent) {
        setMessage(normalizeApiMessage(data?.detail, "Errore aggiornamento stato."));
      }
      return false;
    }
    return true;
  }

  async function updateStatus(id: string, status: Status, engineer_name?: string) {
    const ok = await patchStatus(id, status, false, engineer_name);
    if (!ok) return;
    setMessage(status === "CONFIRMED" ? "Sessione accettata e inviata al calendario." : "Stato aggiornato.");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    await loadBookings();
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
        (failed > 0 ? ` ${failed} non aggiornate.` : "")
    );
    if (success > 0) {
      await loadBookings();
    }
  }

  if (!token) {
    return (
      <main className="mx-0 w-full max-w-none px-4 py-12 md:px-6 xl:px-8">
        <section className="surface mx-auto w-full max-w-md rounded-2xl p-6">
          <h1 className="font-[var(--font-space)] text-3xl">Admin Login</h1>
          <form onSubmit={login} className="mt-6 grid gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-white/15 bg-transparent p-3"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-white/15 bg-transparent p-3"
            />
            <button className="rounded-full border border-accent px-5 py-2">LOGIN</button>
          </form>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
        </section>
      </main>
    );
  }

  function setView(view: AdminView) {
    setActiveView(view);
    setMobileMenuOpen(false);
    if (view === "listino") { loadPricing(); loadCustomServices(); }
    if (view === "agenda" || view === "home") syncCalendar(true);
  }

  const sidebarContent = (
    <>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin Studio</p>
      <h1 className="mt-2 font-[var(--font-space)] text-2xl">Control Panel</h1>
      <div className="mt-4 grid gap-2">
        <button
          onClick={() => setView("home")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "home" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Home
        </button>
        <button
          onClick={() => setView("agenda")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "agenda" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Agenda sessioni
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "calendar" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Calendario
        </button>
        <button
          onClick={() => setView("bookings")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "bookings" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Prenotazioni
        </button>
        <button
          onClick={() => setView("tools")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "tools" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Azioni
        </button>
        <button
          onClick={() => setView("listino")}
          className={`rounded-lg border px-3 py-2 text-left text-sm ${activeView === "listino" ? "border-accent bg-accent/10" : "border-white/15 hover:border-accent/50"}`}
        >
          Listino prezzi
        </button>
        <button
          onClick={() => {
            setOpenBooking(true);
            setMobileMenuOpen(false);
          }}
          className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-left text-sm"
        >
          + Aggiungi Prenotazione
        </button>
      </div>
      <div className="mt-5 space-y-1 text-xs text-muted">
        <p>{`Pending: ${visiblePending.length}`}</p>
        <p>{`Gestite: ${visibleManaged.length}`}</p>
        <p>{`Selezionate: ${selectedIds.size}`}</p>
      </div>
      <button onClick={() => logout()} className="mt-5 w-full rounded-lg border border-white/20 px-3 py-2 text-sm">
        Logout
      </button>
    </>
  );

  return (
    <main className="mx-0 w-full max-w-none px-4 py-10 md:px-6 xl:px-8">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h1 className="font-[var(--font-space)] text-2xl">Admin</h1>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.12em]"
        >
          Menu
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface hidden h-fit rounded-2xl p-4 lg:sticky lg:top-20 lg:block">
          {sidebarContent}
        </aside>

        <div className="space-y-6">
          {activeView === "home" || activeView === "tools" ? (
            <section className="surface rounded-2xl p-5">
            <div className="flex flex-wrap items-end gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca artista, cliente, telefono..."
                className="min-w-[260px] flex-1 rounded-xl border border-white/15 bg-transparent p-2.5 text-sm"
              />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="rounded-xl border border-white/15 bg-transparent p-2.5 text-sm"
              >
                <option value="datetime_desc">Più recenti</option>
                <option value="datetime_asc">Più vecchie</option>
                <option value="customer_asc">Cliente A-Z</option>
                <option value="customer_desc">Cliente Z-A</option>
                <option value="price_desc">Prezzo alto-basso</option>
                <option value="price_asc">Prezzo basso-alto</option>
              </select>
              <button onClick={loadBookings} className="rounded-full border border-accent px-5 py-2 text-sm">
                Aggiorna
              </button>
              <button
                onClick={() => bulkUpdate("CONFIRMED")}
                disabled={selectedIds.size === 0 || bulkLoading}
                className="rounded-full border border-accent px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Conferma Selezionate ({selectedIds.size})
              </button>
              <button
                onClick={() => bulkUpdate("CANCELED")}
                disabled={selectedIds.size === 0 || bulkLoading}
                className="rounded-full border border-white/20 px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Rifiuta Selezionate
              </button>
            </div>
            {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
            </section>
          ) : null}

          <div className={activeView === "home" ? "grid gap-6 lg:grid-cols-[1.15fr_0.85fr]" : "space-y-6"}>
          {activeView === "home" || activeView === "calendar" ? (
            <section>
          {calendarEmbedUrl ? (
            <iframe
              title="Google Calendar Studio"
              src={calendarEmbedUrl}
              className="h-[760px] w-full rounded-xl border border-white/10 bg-black/20"
              loading="lazy"
            />
          ) : null}
          {!calendarEmbedUrl ? (
            <p className="text-sm text-muted">Calendario non configurato nel frontend.</p>
          ) : null}
            </section>
          ) : null}

          {activeView === "home" || activeView === "bookings" ? (
            <section className="surface rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            {collapsibleSections ? (
              <button type="button" onClick={() => setShowPending((v) => !v)} className="text-left text-xl font-medium">
                Sessioni Da Accettare {pendingSectionOpen ? "▾" : "▸"}
              </button>
            ) : (
              <h2 className="text-left text-xl font-medium">Sessioni Da Accettare</h2>
            )}
            <span className="rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-xs">{visiblePending.length}</span>
          </div>

          {pendingSectionOpen ? (
            <div className="mb-3 flex flex-wrap gap-2">
              <button onClick={() => selectMany(visiblePending.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Seleziona Visibili
              </button>
              <button onClick={() => unselectMany(visiblePending.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Deseleziona Visibili
              </button>
            </div>
          ) : null}

          {pendingSectionOpen ? (
            <div className="grid gap-3">
              {visiblePending.length === 0 ? <p className="text-sm text-muted">Nessuna sessione in attesa.</p> : null}
              {visiblePending.map((b) => (
                <article key={b.id} className="rounded-xl border border-white/15 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelected(b.id)} />
                      Seleziona
                    </label>
                    <span className="text-xs text-muted">{b.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{b.customer_name}</p>
                      <p className="text-sm text-muted">
                        {b.date} · {b.start_time} · {b.package_items?.map((item) => `${item.service}(${item.hours}h)`).join(" + ") || b.service} · {b.hours}h · {b.price_total}€
                      </p>
                      {b.artist_name ? (
                        <p className="text-sm text-muted">Artista: {b.artist_name}</p>
                      ) : null}
                      <p className="text-sm text-muted">{b.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setConfirmingId(b.id);
                          setEngineerChoice("NARDI");
                        }}
                        className="rounded-lg border border-accent px-3 py-1 text-xs"
                      >
                        Accetta
                      </button>
                      <button onClick={() => updateStatus(b.id, "CANCELED")} className="rounded-lg border border-white/20 px-3 py-1 text-xs">
                        Rifiuta
                      </button>
                    </div>
                  </div>
                  {confirmingId === b.id ? (
                    <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Fonico per questa sessione</p>
                      <div className="flex flex-wrap gap-2">
                        {(["NARDI", "SVG", ""] as const).map((choice) => (
                          <button
                            key={choice || "none"}
                            type="button"
                            onClick={() => setEngineerChoice(choice)}
                            className={`rounded-full border px-4 py-1.5 text-xs transition ${
                              engineerChoice === choice ? "border-accent bg-accent/15 text-accent" : "border-white/20 text-muted hover:border-accent/40"
                            }`}
                          >
                            {choice === "" ? "Nessuno" : choice}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            updateStatus(b.id, "CONFIRMED", engineerChoice || undefined);
                            setConfirmingId(null);
                          }}
                          className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs text-accent"
                        >
                          Conferma sessione
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {activeView !== "home" ? (
            <>
            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-left text-sm uppercase tracking-[0.12em] text-muted">Già Gestite</h3>
              <span className="text-xs text-muted">{visibleManaged.length}</span>
            </div>
            <div className="mt-3 mb-3 flex flex-wrap gap-2">
              <button onClick={() => selectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Seleziona Visibili
              </button>
              <button onClick={() => unselectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Deseleziona Visibili
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {visibleManaged.map((b) => (
                <article key={b.id} className="rounded-lg border border-white/10 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelected(b.id)} />
                      Seleziona
                    </label>
                    <span className="text-xs text-muted">{b.status}</span>
                  </div>
                  <p className="text-sm">
                    {b.date} {b.start_time} · {b.customer_name}
                  </p>
                  <p className="text-xs text-muted">{`Fonico: ${b.engineer_name || "NARDI"} · Artista: ${b.artist_name || b.customer_name}`}</p>
                </article>
              ))}
            </div>
            </>
          ) : null}
            </section>
          ) : null}
          </div>

          {activeView === "agenda" || activeView === "home" ? (
            <section className="surface rounded-2xl p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-medium">Sessioni confermate</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => syncCalendar(false)}
                    disabled={agendaLoading}
                    className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs text-accent disabled:opacity-50"
                  >
                    {agendaLoading ? "Sincronizzazione..." : "Sincronizza calendario"}
                  </button>
                  <button onClick={loadUpcoming} className="rounded-full border border-white/20 px-4 py-1.5 text-xs">
                    Aggiorna
                  </button>
                </div>
              </div>
              {syncMessage ? <p className="mb-4 text-sm text-muted">{syncMessage}</p> : null}
              {agendaLoading ? <p className="text-sm text-muted">Caricamento...</p> : null}
              {!agendaLoading && upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted">Nessuna sessione confermata in programma.</p>
              ) : null}
              {!agendaLoading ? (
                <div className="space-y-2">
                  {upcomingSessions.reduce<{ date: string; items: AdminBooking[] }[]>((groups, b) => {
                    const last = groups[groups.length - 1];
                    if (last && last.date === b.date) {
                      last.items.push(b);
                    } else {
                      groups.push({ date: b.date, items: [b] });
                    }
                    return groups;
                  }, []).map(({ date, items }) => (
                    <div key={date}>
                      <p className="mb-2 mt-5 first:mt-0 text-xs uppercase tracking-[0.18em] text-accent">
                        {new Date(date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <div className="space-y-2">
                        {items.map((b) => (
                          <article key={b.id} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                            <div className="min-w-[52px] text-center">
                              <p className="text-lg font-semibold tabular-nums">{b.start_time.slice(0, 5)}</p>
                              <p className="text-[11px] text-muted">{b.hours}h</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {b.artist_name || b.customer_name}
                              </p>
                              <p className="text-xs text-muted mt-0.5">
                                {b.package_items?.map((i) => `${i.service.toUpperCase()}${i.hours > 1 ? ` ${i.hours}h` : ""}`).join(" · ") || b.service.toUpperCase()}
                                {b.engineer_name ? ` · Fonico: ${b.engineer_name}` : ""}
                              </p>
                              {b.customer_name !== b.artist_name ? (
                                <p className="text-xs text-muted">{b.customer_name} · {b.phone}</p>
                              ) : (
                                <p className="text-xs text-muted">{b.phone}</p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-accent whitespace-nowrap">{b.price_total} €</p>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {activeView === "home" ? (
            <section className="surface rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={() => setShowManaged((v) => !v)} className="text-left text-sm uppercase tracking-[0.12em] text-muted">
                  Già Gestite {managedSectionOpen ? "▾" : "▸"}
                </button>
                <span className="text-xs text-muted">{visibleManaged.length}</span>
              </div>
              {managedSectionOpen ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button onClick={() => selectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                    Seleziona Visibili
                  </button>
                  <button onClick={() => unselectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                    Deseleziona Visibili
                  </button>
                </div>
              ) : null}
              {managedSectionOpen ? (
                <div className="grid gap-2">
                  {visibleManaged.length === 0 ? <p className="text-sm text-muted">Nessuna sessione gestita.</p> : null}
                  {visibleManaged.map((b) => (
                    <article key={b.id} className="rounded-lg border border-white/10 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-muted">
                          <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelected(b.id)} />
                          Seleziona
                        </label>
                        <span className="text-xs text-muted">{b.status}</span>
                      </div>
                      <p className="text-sm">
                        {b.date} {b.start_time} · {b.customer_name}
                      </p>
                      <p className="text-xs text-muted">{`Fonico: ${b.engineer_name || "NARDI"} · Artista: ${b.artist_name || b.customer_name}`}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {activeView === "listino" ? (
            <section className="surface rounded-2xl p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-medium">Listino prezzi</h2>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!confirm("Vuoi salvare i prezzi attuali come default? Questa operazione sovrascrive i valori base nel file di configurazione.")) return;
                      setPricingMessage("");
                      const res = await fetch(`${API_URL}/admin/pricing/save-defaults`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setPricingMessage("Prezzi salvati come default. I prezzi modificati sono ora il nuovo punto di partenza.");
                        await loadPricing();
                      } else {
                        setPricingMessage("Errore durante il salvataggio.");
                      }
                    }}
                    className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted hover:border-accent/40 hover:text-text"
                  >
                    Salva come default
                  </button>
                  <button onClick={loadPricing} className="rounded-full border border-white/20 px-4 py-1.5 text-xs">
                    Aggiorna
                  </button>
                </div>
              </div>
              {pricingMessage ? (
                <p className="mb-4 text-sm text-muted">{pricingMessage}</p>
              ) : null}
              {pricingLoading ? (
                <p className="text-sm text-muted">Caricamento...</p>
              ) : (
                <div className="space-y-6">
                  {/* Servizi di default */}
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">Servizi standard</p>
                    <div className="grid gap-3">
                      {pricingServices.map((s) => (
                        <div
                          key={s.code}
                          className={`rounded-xl border p-4 transition ${s.active ? "border-white/15" : "border-white/8 opacity-50"}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{s.label}</p>
                              <p className="mt-0.5 text-xs text-muted">
                                {s.type === "hourly" ? "Tariffa oraria" : "Prezzo fisso"} · default {s.base_price} €
                              </p>
                            </div>
                            <button
                              onClick={() => toggleActive(s.code, !s.active)}
                              className={`rounded-full border px-3 py-1 text-xs transition ${
                                s.active ? "border-accent/50 bg-accent/10 text-accent" : "border-white/20 text-muted hover:border-accent/40"
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
                                onChange={(e) => setPricingEdits((prev) => ({ ...prev, [s.code]: e.target.value }))}
                                className="w-28 rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm"
                              />
                              <span className="text-sm text-muted">EUR{s.type === "hourly" ? " / ora" : ""}</span>
                            </div>
                            <button onClick={() => savePricing(s.code)} className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs text-accent">
                              Salva
                            </button>
                            {s.price !== s.base_price ? (
                              <button onClick={() => resetPricing(s.code)} className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-muted">
                                Ripristina default ({s.base_price} €)
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Servizi custom */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Servizi aggiuntivi</p>
                      <button
                        onClick={() => setShowNewServiceForm((v) => !v)}
                        className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs text-accent"
                      >
                        {showNewServiceForm ? "Annulla" : "+ Aggiungi servizio"}
                      </button>
                    </div>

                    {showNewServiceForm ? (
                      <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
                        <p className="mb-3 text-sm font-medium">Nuovo servizio</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs text-muted">Nome *</label>
                            <input
                              placeholder="es. Pack Promo"
                              value={newService.label}
                              onChange={(e) => setNewService((p) => ({ ...p, label: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Codice interno * (solo lettere/numeri/_)</label>
                            <input
                              placeholder="es. pack_promo"
                              value={newService.code}
                              onChange={(e) => setNewService((p) => ({ ...p, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm font-mono"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Tipo</label>
                            <select
                              value={newService.service_type}
                              onChange={(e) => setNewService((p) => ({ ...p, service_type: e.target.value as "fixed" | "hourly" }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                            >
                              <option value="fixed">Prezzo fisso</option>
                              <option value="hourly">Tariffa oraria</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted">Prezzo (€) *</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={newService.price}
                              onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-muted">Descrizione</label>
                            <input
                              placeholder="Breve descrizione del servizio"
                              value={newService.description}
                              onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                              className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button onClick={createCustomService} className="rounded-full border border-accent bg-accent/10 px-5 py-2 text-xs text-accent">
                            Crea servizio
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {customServices.length === 0 && !showNewServiceForm ? (
                      <p className="text-sm text-muted">Nessun servizio aggiuntivo. Clicca "+ Aggiungi servizio" per crearne uno.</p>
                    ) : null}

                    <div className="grid gap-3">
                      {customServices.map((s) => (
                        <div key={s.code} className={`rounded-xl border p-4 transition ${s.active ? "border-white/15" : "border-white/8 opacity-50"}`}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{s.label}</p>
                              <p className="mt-0.5 text-xs text-muted font-mono">{s.code} · {s.service_type === "hourly" ? "Tariffa oraria" : "Prezzo fisso"} · {s.price} €</p>
                              {s.description ? <p className="mt-1 text-xs text-muted">{s.description}</p> : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleActive(s.code, !s.active)}
                                className={`rounded-full border px-3 py-1 text-xs transition ${s.active ? "border-accent/50 bg-accent/10 text-accent" : "border-white/20 text-muted"}`}
                              >
                                {s.active ? "Attivo" : "Disattivato"}
                              </button>
                              <button
                                onClick={() => deleteCustomService(s.code, s.label)}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted hover:border-red-400/40 hover:text-red-400"
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
                                onChange={(e) => setPricingEdits((prev) => ({ ...prev, [s.code]: e.target.value }))}
                                className="w-28 rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm"
                              />
                              <span className="text-sm text-muted">EUR{s.service_type === "hourly" ? " / ora" : ""}</span>
                            </div>
                            <button
                              onClick={async () => {
                                const price = parseInt(pricingEdits[s.code] ?? "", 10);
                                if (isNaN(price)) return;
                                await fetch(`${API_URL}/admin/custom-services/${s.code}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ price }),
                                });
                                setPricingMessage("Prezzo aggiornato.");
                                await loadCustomServices();
                              }}
                              className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs text-accent"
                            >
                              Salva
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Chiudi menu" className="absolute inset-0 bg-black/55" onClick={() => setMobileMenuOpen(false)} />
          <aside className="surface absolute left-0 top-0 h-full w-[88vw] max-w-[340px] overflow-y-auto border-r border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.12em] text-muted">Menu</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-lg border border-white/20 px-3 py-1 text-xs">
                Chiudi
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}
      <BookingDialog open={openBooking} onClose={() => setOpenBooking(false)} />
    </main>
  );
}
