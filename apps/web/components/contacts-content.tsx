"use client";

import { FormEvent, useState } from "react";

export function ContactsContent() {
  const [msg, setMsg] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("Messaggio inviato. Ti rispondiamo al più presto.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="surface rounded-2xl p-6">
        <h2 className="font-[var(--font-space)] text-2xl">Info</h2>
        <p className="mt-4 text-sm text-muted">WhatsApp: +39 388 3739941</p>
        <p className="text-sm text-muted">Email: 19.98recordingstudio@gmail.com</p>
        <p className="text-sm text-muted">Via Umberto Minervini 25</p>
        <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
          <iframe title="Mappa Bari" src="https://maps.google.com/maps?q=Bari&t=&z=13&ie=UTF8&iwloc=&output=embed" className="h-[280px] w-full" loading="lazy" />
        </div>
      </section>

      <form onSubmit={onSubmit} className="surface rounded-2xl p-6">
        <h2 className="font-[var(--font-space)] text-2xl">Scrivici</h2>
        <div className="mt-5 grid gap-3">
          <input required placeholder="Nome" className="rounded-xl border border-white/15 bg-transparent p-3" />
          <input type="email" required placeholder="Email" className="rounded-xl border border-white/15 bg-transparent p-3" />
          <textarea required placeholder="Messaggio" rows={5} className="rounded-xl border border-white/15 bg-transparent p-3" />
          <button className="accent-hover mt-2 rounded-full border border-accent bg-accent/10 px-7 py-3 text-sm">INVIA</button>
        </div>
        {msg ? <p className="mt-4 text-sm text-muted">{msg}</p> : null}
      </form>
    </div>
  );
}
