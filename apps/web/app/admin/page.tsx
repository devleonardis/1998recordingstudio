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
type AdminView = "home" | "calendar" | "bookings" | "tools";

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

  async function patchStatus(id: string, status: Status, silent = false): Promise<boolean> {
    const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
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

  async function updateStatus(id: string, status: Status) {
    const ok = await patchStatus(id, status);
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
                        {b.date} · {b.start_time} · {b.package_items?.map((item) => `${item.service}(${item.hours}h)`).join(" + ") || b.service} · {b.hours}h studio · {b.price_total}€
                      </p>
                      <p className="text-sm text-muted">
                        {`Fonico: ${b.engineer_name || "NARDI"} · Artista: ${b.artist_name || b.customer_name}`}
                      </p>
                      <p className="text-sm text-muted">
                        {b.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(b.id, "CONFIRMED")} className="rounded-lg border border-accent px-3 py-1 text-xs">
                        Accetta
                      </button>
                      <button onClick={() => updateStatus(b.id, "CANCELED")} className="rounded-lg border border-white/20 px-3 py-1 text-xs">
                        Rifiuta
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between">
            {collapsibleSections ? (
              <button type="button" onClick={() => setShowManaged((v) => !v)} className="text-left text-sm uppercase tracking-[0.12em] text-muted">
                Già Gestite {managedSectionOpen ? "▾" : "▸"}
              </button>
            ) : (
              <h3 className="text-left text-sm uppercase tracking-[0.12em] text-muted">Già Gestite</h3>
            )}
            <span className="text-xs text-muted">{visibleManaged.length}</span>
          </div>
          {managedSectionOpen ? (
            <div className="mt-3 mb-3 flex flex-wrap gap-2">
              <button onClick={() => selectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Seleziona Visibili
              </button>
              <button onClick={() => unselectMany(visibleManaged.map((b) => b.id))} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                Deseleziona Visibili
              </button>
            </div>
          ) : null}
          {managedSectionOpen ? (
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
          ) : null}
            </section>
          ) : null}
          </div>
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
