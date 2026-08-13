export function BlogCta() {
  return (
    <div className="mt-10 rounded-2xl border border-[#CD7948]/25 bg-[#CD7948]/[0.08] px-5 py-8 text-center">
      <p className="mb-2 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
        19.98 Recording Studio
      </p>
      <h3
        className="mb-3 text-xl font-semibold text-white"
        style={{ fontFamily: "var(--font-space)" }}
      >
        Pronto a realizzare il tuo progetto?
      </h3>
      <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#B8ABA2]">
        Contattaci per il tuo progetto al 19.98 Recording Studio di Bari. Risposta entro 24 ore.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href="https://wa.me/393883739941"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#CD7948] bg-[#CD7948] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09]"
        >
          WhatsApp
        </a>
        <a
          href="/#contatti"
          className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-[#E4E2DB]"
        >
          Contatti
        </a>
      </div>
    </div>
  );
}
