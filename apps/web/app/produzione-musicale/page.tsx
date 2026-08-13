import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Produzione Musicale Professionale a Bari | 19.98 Studio",
  description:
    "Servizio di produzione musicale professionale a Bari. Concept, arrangiamento, sound design e direzione artistica. 19.98 Recording Studio.",
  keywords: [
    "produzione musicale Bari",
    "producer musicale Bari",
    "beatmaker Bari",
    "direzione artistica Bari",
    "produzione rap Bari",
  ],
  alternates: { canonical: "/produzione-musicale" },
  openGraph: {
    title: "Produzione Musicale Professionale a Bari | 19.98 Studio",
    description:
      "Servizio di produzione musicale professionale a Bari. Concept, arrangiamento, sound design e direzione artistica. 19.98 Recording Studio.",
    url: "/produzione-musicale",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Produzione Musicale Professionale",
  description:
    "Servizio di produzione musicale per artisti e producer a Bari. Direzione artistica, arrangiamento, sound design e supervisione delle sessioni di registrazione.",
  provider: {
    "@type": "Organization",
    name: "19.98 Recording Studio",
    url: "https://www.1998recordingstudio.it",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Via Umberto Minervini 25",
      addressLocality: "Bari",
      addressRegion: "BA",
      postalCode: "70124",
      addressCountry: "IT",
    },
  },
  areaServed: {
    "@type": "City",
    name: "Bari",
  },
  serviceType: "Music Production",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.1998recordingstudio.it",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Produzione Musicale",
      item: "https://www.1998recordingstudio.it/produzione-musicale",
    },
  ],
};

export default function ProduzioneMusicalePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="pb-20 pt-5 md:pb-24 md:pt-10">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#B8ABA2]">
            Servizio · Produzione Musicale
          </div>

          <h1
            className="mb-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Produzione Musicale Professionale a Bari
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-7 text-[#B8ABA2] md:text-lg">
            Il 19.98 Recording Studio offre un servizio completo di produzione musicale a Bari:
            dalla direzione artistica al beat finito, con producer esperti nei principali generi
            contemporanei. Costruiamo insieme il suono del tuo progetto.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#contatti"
              className="rounded-full border border-[#CD7948] bg-[#CD7948] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] text-center"
            >
              Contattaci
            </Link>
            <a
              href="https://wa.me/393883739941"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-[#E4E2DB] text-center"
            >
              Scrivici su WhatsApp
            </a>
          </div>
        </section>

        {/* ── Cos'è la produzione ───────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Cos&apos;è la produzione musicale
          </h2>
          <p className="mb-4 text-base leading-7 text-[#B8ABA2]">
            La produzione musicale è molto più della semplice creazione di un beat. Il producer
            musicale è il direttore artistico del tuo progetto: define il concept sonoro, costruisce
            la sound palette — ovvero l&apos;insieme di suoni e strumenti che ti identificano —
            lavora sull&apos;arrangiamento delle parti e guida l&apos;artista verso la versione
            migliore di ogni brano.
          </p>
          <p className="text-base leading-7 text-[#B8ABA2]">
            Al 19.98 Recording Studio di Bari, la produzione musicale è un processo collaborativo:
            ascoltiamo le tue idee, le tue reference track e il tuo background artistico, e
            costruiamo con te un suono che ti rappresenti in modo autentico. Non esiste una formula
            unica: ogni progetto ha la sua identità sonora.
          </p>
        </section>

        {/* ── Processo ──────────────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-20">
          <h2
            className="mb-6 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Il processo di produzione al 19.98
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Sessione conoscitiva",
                text: "Iniziamo con un incontro per capire il tuo progetto, le tue influenze e il posizionamento artistico che vuoi raggiungere.",
              },
              {
                step: "02",
                title: "Reference track",
                text: "Analizziamo insieme i brani che ti ispirano per definire la direzione sonora e il genere di riferimento.",
              },
              {
                step: "03",
                title: "Concept e sound palette",
                text: "Il producer costruisce la sound palette del progetto: gli strumenti, i synth, i sample e i suoni che diventeranno la tua firma.",
              },
              {
                step: "04",
                title: "Produzione delle basi",
                text: "Creazione e revisione dei beat in sessione, con feedback continuo per garantire che ogni base rispecchi la visione artistica.",
              },
              {
                step: "05",
                title: "Arrangiamento",
                text: "Ottimizzazione della struttura del brano: intro, strofa, ritornello, bridge e outro vengono bilanciati per massimizzare l'impatto.",
              },
              {
                step: "06",
                title: "Supervisione del recording",
                text: "Il producer segue le sessioni di registrazione vocale per garantire che la performance si integri perfettamente con la produzione.",
              },
            ].map((item) => (
              <div key={item.step} className="surface accent-hover rounded-2xl p-6">
                <span className="mb-3 block text-2xl font-bold text-[#CD7948]/40">{item.step}</span>
                <h3 className="mb-2 font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Generi ────────────────────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Generi musicali
          </h2>
          <p className="mb-6 text-base leading-7 text-[#B8ABA2]">
            Il team di produzione del 19.98 ha esperienza nei principali generi della musica
            italiana e internazionale contemporanea. Conosciamo le regole sonore di ogni stile e
            sappiamo come adattare la produzione al mercato di riferimento.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Rap", "Trap", "Pop italiano", "RnB", "Afrobeat", "Urban", "Drill", "Indie pop"].map(
              (genre) => (
                <div
                  key={genre}
                  className="surface rounded-xl px-4 py-3 text-center text-sm font-medium text-[#E4E2DB]"
                >
                  {genre}
                </div>
              ),
            )}
          </div>
        </section>

        {/* ── Cosa include ──────────────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Cosa include il servizio di produzione
          </h2>
          <ul className="space-y-3">
            {[
              "Sessione conoscitiva per definire il concept e la direzione artistica",
              "Creazione delle basi musicali con strumenti e synth selezionati per il progetto",
              "Arrangiamento completo della struttura del brano",
              "Sound design personalizzato per costruire un'identità sonora originale",
              "Supervisione delle sessioni di registrazione vocale",
              "Coordinamento con il fonico per garantire coerenza tra produzione e performance",
              "Revisioni sulla produzione fino all'approvazione dell'artista",
              "Consegna dei file di produzione in formato compatibile con il mix",
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-[#B8ABA2]">
                <span className="text-[#CD7948]">—</span>
                <span className="text-base leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── A chi è rivolto ───────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-20">
          <h2
            className="mb-6 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            A chi è rivolto
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              {
                title: "Artisti emergenti",
                text: "Hai una voce e delle idee ma non sai da dove iniziare? Il nostro team ti guida dalla prima sessione alla release finale.",
              },
              {
                title: "Artisti già avviati",
                text: "Cerchi un nuovo suono o un producer con cui costruire un progetto discografico strutturato? Lavoriamo insieme.",
              },
              {
                title: "Producer e beatmaker",
                text: "Vuoi collaborare con un fonico esperto per portare le tue produzioni a un livello superiore? Il 19.98 è il posto giusto.",
              },
              {
                title: "Team e collettivi",
                text: "Artisti, producer e vocalist che lavorano insieme trovano al 19.98 uno spazio organizzato per sessioni multi-track.",
              },
            ].map((card) => (
              <div key={card.title} className="surface accent-hover rounded-2xl p-6">
                <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#CD7948]/20 bg-[#CD7948]/5 px-6 py-10 text-center md:px-12">
          <p className="mb-2 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
            Produzione Musicale · Bari
          </p>
          <h2
            className="mb-4 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Costruiamo insieme il suono del tuo progetto
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-[#B8ABA2]">
            Prenota una sessione di produzione musicale al 19.98 Recording Studio di Bari.
            Direzione artistica, arrangiamento e sound design con producer esperti.
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
        </section>
      </main>
    </>
  );
}
