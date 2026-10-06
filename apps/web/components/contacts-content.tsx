"use client";

import { FormEvent, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { TiltCard } from "./fx/interactive";

export function ContactsContent() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1400);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <TiltCard className="rounded-2xl" max={5}>
        <section className="surface h-full rounded-2xl p-6">
          <h2 className="font-[var(--font-space)] text-2xl">Info</h2>
          <p className="mt-4 text-sm text-muted">WhatsApp: +39 388 3739941</p>
          <p className="text-sm text-muted">Email: 19.98recordingstudio@gmail.com</p>
          <p className="text-sm text-muted">Via Umberto Minervini 25</p>
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <iframe title="Mappa Bari" src="https://maps.google.com/maps?q=Bari&t=&z=13&ie=UTF8&iwloc=&output=embed" className="h-[280px] w-full" loading="lazy" />
          </div>
        </section>
      </TiltCard>

      <form onSubmit={onSubmit} className="surface relative rounded-2xl p-6">
        <h2 className="font-[var(--font-space)] text-2xl">Scrivici</h2>
        <div className="mt-5 grid gap-3">
          <input required placeholder="Nome" className="rounded-xl border border-white/15 bg-transparent p-3 outline-none transition-colors focus:border-accent/70" />
          <input type="email" required placeholder="Email" className="rounded-xl border border-white/15 bg-transparent p-3 outline-none transition-colors focus:border-accent/70" />
          <textarea required placeholder="Messaggio" rows={5} className="rounded-xl border border-white/15 bg-transparent p-3 outline-none transition-colors focus:border-accent/70" />
          <button
            disabled={status !== "idle"}
            className="accent-hover mt-2 flex items-center justify-center gap-3 rounded-full border border-accent bg-accent/10 px-7 py-3 text-sm disabled:cursor-default"
          >
            {status === "sending" ? (
              <>
                <ThinkingOrb state="composing" size={20} theme="dark" aria-label="Invio in corso" />
                INVIO IN CORSO
              </>
            ) : status === "sent" ? (
              <>
                <span className="t-success-check text-accent" data-state="in" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                INVIATO
              </>
            ) : (
              "INVIA"
            )}
          </button>
        </div>
        <p aria-live="polite" className="mt-4 min-h-5 text-sm text-muted">
          {status === "sent" ? "Messaggio inviato. Ti rispondiamo al più presto." : ""}
        </p>
      </form>
    </div>
  );
}
