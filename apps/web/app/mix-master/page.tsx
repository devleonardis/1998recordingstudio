import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mix e Master Professionale a Bari | 19.98 Studio",
  description:
    "Servizio di mix e master professionale a Bari. Bilanciamento, ottimizzazione per streaming, delivery pronti. Prenota online al 19.98 Recording Studio.",
  keywords: [
    "mix e master Bari",
    "mix master professionale",
    "mastering online",
    "mixing Bari",
    "master per streaming",
  ],
  alternates: { canonical: "/mix-master" },
  openGraph: {
    title: "Mix e Master Professionale a Bari | 19.98 Studio",
    description:
      "Servizio di mix e master professionale a Bari. Bilanciamento, ottimizzazione per streaming, delivery pronti. Prenota online al 19.98 Recording Studio.",
    url: "/mix-master",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Mix e Master Professionale",
  description:
    "Servizio di mixing e mastering professionale per artisti e producer a Bari. Bilanciamento delle tracce, ottimizzazione LUFS per piattaforme streaming, consegna in formato WAV e MP3.",
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
      name: "Mix e Master",
      item: "https://www.1998recordingstudio.it/mix-master",
    },
  ],
};

export default function MixMasterPage() {
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
            Servizio · Mix &amp; Master
          </div>

          <h1
            className="mb-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Mix e Master Professionale a Bari
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-7 text-[#B8ABA2] md:text-lg">
            Dal mixdown finale al master pronto per Spotify: il 19.98 Recording Studio offre un
            servizio completo di mixing e mastering professionale a Bari, ottimizzato per le
            piattaforme streaming e per qualsiasi formato di distribuzione.
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

        {/* ── Cos'è il Mixing ───────────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Cos&apos;è il Mixing
          </h2>
          <p className="mb-4 text-base leading-7 text-[#B8ABA2]">
            Il mixing è il processo di bilanciamento e lavorazione di tutte le tracce audio che
            compongono un brano. Il mix engineer prende le tracce grezze registrate in studio e le
            lavora per creare un insieme coerente, bilanciato e piacevole all&apos;ascolto. Ogni
            elemento — voce, basso, batteria, synth, effetti — deve trovare il suo spazio nel campo
            sonoro senza sovrastare gli altri.
          </p>
          <p className="text-base leading-7 text-[#B8ABA2]">
            Durante la fase di mixing utilizziamo EQ per gestire le frequenze di ogni traccia,
            compressori per controllare la dinamica, reverb e delay per aggiungere profondità, e
            strumenti di stereo image per costruire una coerenza sonora convincente. Il risultato è
            un mixdown stereo bilanciato, pronto per il passaggio al mastering.
          </p>
        </section>

        {/* ── Cos'è il Mastering ────────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Cos&apos;è il Mastering
          </h2>
          <p className="mb-4 text-base leading-7 text-[#B8ABA2]">
            Il mastering è l&apos;ultima fase della post-produzione prima della distribuzione. Il
            master engineer lavora sul mixdown stereo per ottimizzare il loudness integrato (LUFS),
            garantire la coerenza sonora tra i brani di un album e preparare i file per ogni formato
            di distribuzione: streaming, download digitale o supporto fisico.
          </p>
          <p className="text-base leading-7 text-[#B8ABA2]">
            Le piattaforme streaming come Spotify applicano la normalizzazione a -14 LUFS integrati.
            Un mastering professionale porta il tuo brano al livello corretto senza sacrificare la
            dinamica e il punch, assicurando che suoni forte e bilanciato in qualsiasi contesto di
            ascolto: dalle cuffie agli impianti da auto.
          </p>
        </section>

        {/* ── Processo ──────────────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-20">
          <h2
            className="mb-6 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Il nostro processo di Mix &amp; Master
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Invio dei file",
                text: "Ci invii le tracce registrate in formato WAV con sufficiente headroom. Per il solo master, ci invii il mixdown stereo.",
              },
              {
                step: "02",
                title: "Reference track",
                text: "Condividi i brani di riferimento che ti ispirano: è il modo più diretto per allineare la visione sonora.",
              },
              {
                step: "03",
                title: "Mix in session",
                text: "Il fonico lavora il mix nella DAW, bilanciando frequenze, dinamica e spazio stereo in modo preciso.",
              },
              {
                step: "04",
                title: "Revisione",
                text: "Ti inviamo il mix per l'ascolto. Se necessario, apportiamo le modifiche concordate fino alla tua approvazione.",
              },
              {
                step: "05",
                title: "Mastering",
                text: "Il master engineer ottimizza il loudness per streaming e prepara i file nei formati richiesti.",
              },
              {
                step: "06",
                title: "Consegna finale",
                text: "Ricevi i file finali in WAV 24-bit e MP3 320 kbps, pronti per la distribuzione su qualsiasi piattaforma.",
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

        {/* ── A chi è rivolto ───────────────────────────────────────────────── */}
        <section className="mb-16 max-w-3xl md:mb-20">
          <h2
            className="mb-4 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            A chi è rivolto il servizio
          </h2>
          <p className="mb-4 text-base leading-7 text-[#B8ABA2]">
            Il servizio di mix e master del 19.98 è pensato per artisti solisti, band, rapper,
            cantanti pop e producer che vogliono portare le loro produzioni a uno standard
            professionale. Non è necessario aver registrato in studio da noi: puoi inviarci le
            tracce da qualsiasi provenienza.
          </p>
          <ul className="space-y-2 pl-4">
            {[
              "Artisti solisti con brani registrati in home studio che vogliono un master professionale",
              "Producer e beatmaker che cercano un mix engineer esperto per i loro strumentali",
              "Band che hanno registrato in sala e hanno bisogno di un mixdown coerente",
              "Rapper e vocalist che vogliono un singolo pronto per la distribuzione su Spotify",
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-[#B8ABA2]">
                <span className="text-[#CD7948]">—</span>
                <span className="text-sm leading-6">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Consegna e formati ────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-20">
          <h2
            className="mb-6 text-2xl font-semibold text-white"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Consegna e formati
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                format: "WAV 24-bit",
                desc: "Il formato di alta qualità per l'archivio e per future lavorazioni. Headroom ottimale e massima fedeltà sonora.",
              },
              {
                format: "MP3 320 kbps",
                desc: "Il formato compresso per la distribuzione rapida su piattaforme e per la condivisione sui social.",
              },
              {
                format: "Streaming-ready",
                desc: "Loudness ottimizzato per Spotify (-14 LUFS), Apple Music e tutte le principali piattaforme di streaming.",
              },
            ].map((f) => (
              <div key={f.format} className="surface accent-hover rounded-2xl p-6">
                <h3 className="mb-2 font-semibold text-[#CD7948]">{f.format}</h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#CD7948]/20 bg-[#CD7948]/5 px-6 py-10 text-center md:px-12">
          <p className="mb-2 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
            Mix &amp; Master · Bari
          </p>
          <h2
            className="mb-4 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Porta il tuo brano allo standard professionale
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-[#B8ABA2]">
            Prenota il servizio di mix e master al 19.98 Recording Studio di Bari. Consegna rapida,
            revisioni incluse, file pronti per la distribuzione.
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
