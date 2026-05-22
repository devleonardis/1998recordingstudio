import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio di Registrazione a Bari | 19.98 Studio — Recording, Prod, Mix",
  description:
    "Cerchi uno studio di registrazione a Bari? Il 19.98 Studio offre recording professionale, produzione, mix e master. Via Umberto Minervini 25. Prenota online.",
  keywords: [
    "studio di registrazione Bari",
    "studio recording Bari",
    "studio musicale Bari",
    "registrare musica Bari",
    "sala di registrazione Bari",
  ],
  alternates: { canonical: "/studio-registrazione-bari" },
  openGraph: {
    title: "Studio di Registrazione a Bari | 19.98 Studio — Recording, Prod, Mix",
    description:
      "Cerchi uno studio di registrazione a Bari? Il 19.98 Studio offre recording professionale, produzione, mix e master. Via Umberto Minervini 25. Prenota online.",
    url: "/studio-registrazione-bari",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quanto costa una sessione al 19.98 Recording Studio di Bari?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Il costo dipende dal servizio scelto e dalla durata della sessione. Offriamo tariffe orarie competitive e pacchetti completi per recording, mix e master, produzione musicale e noleggio sala. Contattaci per un preventivo personalizzato senza impegno.",
      },
    },
    {
      "@type": "Question",
      name: "Come si prenota una sessione al 19.98 Studio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Puoi prenotare direttamente online tramite il form di prenotazione sul nostro sito, oppure contattarci via WhatsApp al +39 388 3739941 o via email a 19.98recordingstudio@gmail.com. Risponderemo entro 24 ore per confermare la disponibilità.",
      },
    },
    {
      "@type": "Question",
      name: "Quali generi musicali registrate al 19.98 Studio di Bari?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Al 19.98 lavoriamo con tutti i principali generi musicali: rap, trap, pop italiano, RnB, afrobeat e musica urban contemporanea. Il nostro team ha esperienza con artisti di diversi generi e sa adattare il suono alle esigenze di ogni progetto.",
      },
    },
    {
      "@type": "Question",
      name: "Dove si trova il 19.98 Recording Studio a Bari?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Il 19.98 Recording Studio si trova in Via Umberto Minervini 25, Bari (BA). Per indicazioni stradali o per organizzare un sopralluogo preliminare, contattaci via WhatsApp o email.",
      },
    },
  ],
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
      name: "Studio di Registrazione Bari",
      item: "https://www.1998recordingstudio.it/studio-registrazione-bari",
    },
  ],
};

export default function StudioRegistrazioneBariPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="pb-20 pt-5 md:pb-24 md:pt-10">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#B8ABA2]">
            <span className="text-[#CD7948]">📍</span>
            Via Umberto Minervini 25 · Bari
          </div>

          <h1
            className="mb-5 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Studio di Registrazione Professionale a Bari
          </h1>

          <p className="mb-8 max-w-2xl text-base leading-7 text-[#B8ABA2] md:text-lg">
            Il 19.98 Recording Studio è il punto di riferimento per artisti, producer e vocalist a
            Bari. Registrazione vocale, produzione musicale, mix e master con fonico dedicato in una
            sala di registrazione professionale nel cuore della città.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/prenota"
              className="rounded-full border border-[#CD7948] bg-[#CD7948] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] text-center"
            >
              Prenota la tua sessione
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

        {/* ── Perché scegliere 19.98 ────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <h2
            className="mb-6 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Perché scegliere il 19.98 come tuo studio di registrazione a Bari
          </h2>
          <p className="mb-8 max-w-3xl text-base leading-7 text-[#B8ABA2]">
            A Bari ci sono diversi studi musicali, ma pochi combinano attrezzatura professionale,
            esperienza comprovata e risultati certificati come il 19.98 Recording Studio. La nostra
            sala di registrazione è trattata acusticamente per garantire catture pulite e prive di
            artefatti. Il fonico e l&apos;engineer del suono dedicati seguono ogni sessione dalla
            prima nota al bounce finale. Lavoriamo con DAW professionali, microfoni di alta gamma e
            monitor di riferimento per un missaggio e un mastering all&apos;altezza degli standard
            delle major italiane.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Risultati certificati",
                text: "Dischi d'oro FIMI ottenuti grazie a sessioni realizzate nei nostri studi. Un track record che parla da solo.",
              },
              {
                title: "Fonico dedicato",
                text: "Ogni sessione è guidata da un engineer del suono esperto, che gestisce la catena di segnale e ottimizza ogni take.",
              },
              {
                title: "Attrezzatura professionale",
                text: "Microfoni a condensatore, preamp analogici, monitor calibrati e DAW di riferimento per ogni tipo di progetto.",
              },
            ].map((card) => (
              <div key={card.title} className="surface accent-hover rounded-2xl p-6">
                <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Servizi ───────────────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <h2
            className="mb-6 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Servizi disponibili a Bari
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              {
                title: "Recording",
                desc: "Sessioni di registrazione vocale e strumentale con fonico dedicato, sala trattata acusticamente e headphone mix personalizzato per la massima performance.",
              },
              {
                title: "Produzione Musicale",
                desc: "Dalla direzione artistica al beat finito: creiamo con te il suono del tuo progetto, dall'arrangiamento al sound design, genere per genere.",
              },
              {
                title: "Mix e Master",
                desc: "Bilanciamento professionale delle tracce e ottimizzazione del loudness per Spotify, Apple Music e tutte le piattaforme streaming.",
              },
              {
                title: "Noleggio Studio",
                desc: "La sala di registrazione disponibile per producer, beatmaker e team creativi che lavorano in autonomia, con setup professionale incluso.",
              },
            ].map((service) => (
              <div key={service.title} className="surface accent-hover rounded-2xl p-6">
                <h3
                  className="mb-2 text-lg font-semibold text-white"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  {service.title}
                </h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{service.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Risultati ─────────────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <h2
            className="mb-6 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Risultati certificati
          </h2>
          <p className="mb-8 max-w-3xl text-base leading-7 text-[#B8ABA2]">
            Il 19.98 Recording Studio ha contribuito alla realizzazione di brani che hanno ottenuto
            la certificazione disco d&apos;oro dalla FIMI — la Federazione Industria Musicale
            Italiana. Questi riconoscimenti sono la prova concreta della qualità del lavoro svolto
            all&apos;interno delle nostre sessioni e dell&apos;efficacia del processo produttivo che
            mettiamo a disposizione di ogni artista.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#CD7948]/25 bg-[#CD7948]/[0.08] p-6">
              <p className="mb-1 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
                Certificazione
              </p>
              <p className="text-base leading-6 text-[#E4E2DB]">
                Dischi d&apos;oro certificati FIMI ottenuti su brani registrati, prodotti o mixati
                al 19.98 Recording Studio di Bari.
              </p>
            </div>
            <div className="rounded-2xl border border-[#CD7948]/25 bg-[#CD7948]/[0.08] p-6">
              <p className="mb-1 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
                Standard di qualità
              </p>
              <p className="text-base leading-6 text-[#E4E2DB]">
                Ogni brano che esce dal 19.98 è ottimizzato per competere con le produzioni
                nazionali e internazionali sulle piattaforme streaming.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contatti / Come arrivare ───────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <h2
            className="mb-6 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Come arrivare e contatti
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface rounded-2xl p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Indirizzo</p>
              <address className="not-italic text-sm leading-6 text-[#E4E2DB]">
                Via Umberto Minervini 25
                <br />
                70124 Bari (BA)
                <br />
                Italia
              </address>
            </div>
            <div className="surface rounded-2xl p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Telefono</p>
              <a
                href="tel:+393883739941"
                className="text-sm text-[#E4E2DB] hover:text-[#CD7948]"
              >
                +39 388 3739941
              </a>
            </div>
            <div className="surface rounded-2xl p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Email</p>
              <a
                href="mailto:19.98recordingstudio@gmail.com"
                className="break-all text-sm text-[#E4E2DB] hover:text-[#CD7948]"
              >
                19.98recordingstudio@gmail.com
              </a>
            </div>
            <div className="surface rounded-2xl p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.14em] text-[#CD7948]">Orari</p>
              <p className="text-sm leading-6 text-[#E4E2DB]">
                Lun – Sab
                <br />
                10:00 – 20:00
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-24">
          <h2
            className="mb-8 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Domande frequenti
          </h2>
          <div className="space-y-6 max-w-3xl">
            {[
              {
                q: "Quanto costa una sessione al 19.98 Recording Studio di Bari?",
                a: "Il costo varia in base al servizio scelto: recording orario, pacchetto completo, mix e master, produzione o noleggio sala. Offriamo tariffe competitive per il mercato pugliese e pacchetti su misura per progetto. Contattaci per un preventivo personalizzato senza impegno.",
              },
              {
                q: "Come si prenota una sessione al 19.98 Studio?",
                a: "Puoi prenotare direttamente online tramite il form sul sito, scrivere su WhatsApp al +39 388 3739941 o inviare un'email. Ti risponderemo entro 24 ore per confermare disponibilità e dettagli della sessione.",
              },
              {
                q: "Quali generi musicali registrate al 19.98 Studio di Bari?",
                a: "Lavoriamo con tutti i principali generi: rap, trap, pop italiano, RnB, afrobeat e musica urban contemporanea. Il nostro team è specializzato nel suono attuale delle classifiche italiane e internazionali.",
              },
              {
                q: "Dove si trova il 19.98 Recording Studio a Bari?",
                a: "Siamo in Via Umberto Minervini 25, Bari. La sede è facilmente raggiungibile. Per un sopralluogo preliminare o indicazioni stradali, contattaci via WhatsApp o email.",
              },
            ].map((faq) => (
              <div key={faq.q} className="surface rounded-2xl p-6">
                <h3 className="mb-2 font-semibold text-white">{faq.q}</h3>
                <p className="text-sm leading-6 text-[#B8ABA2]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA finale ────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#CD7948]/20 bg-[#CD7948]/5 px-6 py-10 text-center md:px-12">
          <p className="mb-2 text-sm uppercase tracking-[0.14em] text-[#CD7948]">
            Studio di Registrazione · Bari
          </p>
          <h2
            className="mb-4 text-2xl font-semibold text-white md:text-3xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            Inizia il tuo progetto musicale oggi
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-[#B8ABA2]">
            Prenota la tua sessione al 19.98 Recording Studio di Bari. Recording, produzione, mix e
            master con fonico dedicato e risultati certificati.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/prenota"
              className="rounded-full border border-[#CD7948] bg-[#CD7948] px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-[#140d09]"
            >
              Prenota ora
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
