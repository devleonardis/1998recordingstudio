import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog | Studio di Registrazione Bari — Guide e Consigli",
  description:
    "Guide, consigli e articoli su produzione musicale, recording, mix e master. Dal 19.98 Recording Studio di Bari.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Studio di Registrazione Bari — Guide e Consigli",
    description:
      "Guide, consigli e articoli su produzione musicale, recording, mix e master. Dal 19.98 Recording Studio di Bari.",
    url: "/blog",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <main className="pb-20 pt-5 md:pb-24 md:pt-10">
      {/* Header */}
      <div className="mb-12 md:mb-16">
        <p className="mb-4 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
          Dal 19.98 Recording Studio
        </p>
        <h1
          className="mb-4 font-[var(--font-space)] text-3xl font-semibold text-white sm:text-4xl md:text-5xl"
          style={{ fontFamily: "var(--font-space)" }}
        >
          Blog — Guide per Artisti e Producer
        </h1>
        <p className="max-w-2xl text-base leading-7 text-[#B8ABA2]">
          Risorse pratiche su produzione musicale, recording, mix e master. Tutto quello che devi sapere
          prima di entrare in studio, scritto da chi lavora ogni giorno con la musica.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="surface accent-hover rounded-2xl p-6 block"
          >
            {/* Meta info */}
            <div className="mb-3 flex items-center gap-3 text-xs text-[#B8ABA2]">
              <span>{formatDate(post.date)}</span>
              <span className="text-[#CD7948]/60">·</span>
              <span>{post.readingTime} di lettura</span>
            </div>

            {/* Title */}
            <h2
              className="mb-3 text-base font-semibold leading-snug text-white sm:text-lg"
              style={{ fontFamily: "var(--font-space)" }}
            >
              {post.title}
            </h2>

            {/* Description */}
            <p className="mb-5 text-sm leading-6 text-[#B8ABA2]">{post.description}</p>

            {/* CTA */}
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#CD7948]">
              Leggi l&apos;articolo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 rounded-2xl border border-[#CD7948]/20 bg-[#CD7948]/5 px-6 py-10 text-center md:px-12">
        <p className="mb-2 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
          19.98 Recording Studio · Bari
        </p>
        <h2
          className="mb-4 text-2xl font-semibold text-white md:text-3xl"
          style={{ fontFamily: "var(--font-space)" }}
        >
          Pronto a registrare il tuo prossimo brano?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-base text-[#B8ABA2]">
          Dalle guide alla pratica: prenota la tua sessione al 19.98 Studio e porta il tuo progetto
          al livello successivo.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/#contatti"
            className="rounded-full border border-[#CD7948] bg-[#CD7948] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09]"
          >
            Contattaci
          </Link>
          <a
            href="https://wa.me/393883739941"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-[#E4E2DB]"
          >
            Scrivici su WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
