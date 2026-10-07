"use client";

import { HomeServices } from "@/components/home-services";
import { ContactsContent } from "@/components/contacts-content";
import { NextTrack } from "@/components/next-track";
import { Reveal, Scene, ScrollCard } from "@/components/fx/reveal";
import { TiltCard } from "@/components/fx/interactive";
import { HorizontalTrack, Marquee } from "@/components/fx/stack";
import { HeroRecord } from "@/components/hero-record";

const audience = [
  {
    tag: "Voce",
    title: "Artisti e vocalist",
    text: "Sessioni curate, take più fluide e supporto in studio mentre registri.",
    accent: false,
  },
  {
    tag: "Beat",
    title: "Producer e team",
    text: "Uno spazio pronto, affidabile e già organizzato per lavorare senza perdere tempo.",
    accent: false,
  },
  {
    tag: "Contatto diretto",
    title: "+39 388 3739941",
    text: "Scrivici su WhatsApp, oppure passa in Via Umberto Minervini 25, Bari.",
    accent: true,
  },
] as const;

const certifications = [
  {
    title: "Disco di platino",
    detail: "BIANCA (feat. Kid Yugi): seguita in studio e arrivata alla certificazione di platino.",
    tier: "platinum",
    embedSrc: "https://open.spotify.com/embed/track/420QMNPnHsbAqkkxBt2ifJ?utm_source=generator",
  },
  {
    title: "Disco d'oro",
    detail: "Un risultato concreto che racconta la qualita del lavoro finale.",
    tier: "gold",
    embedSrc: "https://open.spotify.com/embed/album/7vBfg8AHLReQkqXuItmxFP?utm_source=generator",
  },
] as const;

const trustPoints = [
  "Approccio curato su performance, suono e resa finale.",
  "Workflow rapido, sessioni organizzate e file pronti alla consegna.",
  "Un ambiente premium che resta leggibile e accogliente anche su mobile.",
] as const;

const songJourney = [
  { step: "01", title: "Idea", text: "Un vocale, una demo, una reference: partiamo da quello che hai e definiamo la direzione." },
  { step: "02", title: "Produzione", text: "Arrangiamento e sound palette costruiti attorno alla tua voce e al tuo progetto." },
  { step: "03", title: "Recording", text: "Sessione in sala con monitoring preciso e un fonico che segue ogni take." },
  { step: "04", title: "Mix", text: "Ogni elemento trova il suo spazio: profondità, equilibrio, impatto." },
  { step: "05", title: "Master", text: "Loudness e resa ottimizzati per Spotify, Apple Music e ogni impianto." },
  { step: "06", title: "Release", text: "File pronti alla distribuzione. Il brano esce dallo studio e va nel mondo." },
] as const;

const tierStyles: Record<"gold" | "platinum", { card: string; title: string; disc: string; glow: string }> = {
  gold: {
    disc: "[background:radial-gradient(circle,#E6B85C_0_14%,#1a1410_14.5%_16%,transparent_16.5%),repeating-radial-gradient(circle,#2a210f_0_2px,#3a2d12_2px_3px)]",
    glow: "rgba(255,226,160,0.18)",
    card:
      "border-[#E6B85C]/40 bg-[radial-gradient(circle_at_18%_8%,rgba(230,184,92,0.30),rgba(28,20,7,0.92)_45%),linear-gradient(180deg,rgba(24,18,9,0.96),rgba(12,9,5,0.98))] shadow-[0_0_0_1px_rgba(230,184,92,0.16),0_18px_36px_rgba(30,20,8,0.45)]",
    title: "text-[#FFF0CC]",
  },
  platinum: {
    disc: "[background:radial-gradient(circle,#DDE5EE_0_14%,#12161b_14.5%_16%,transparent_16.5%),repeating-radial-gradient(circle,#1b2027_0_2px,#2b323b_2px_3px)]",
    glow: "rgba(220,232,245,0.2)",
    card:
      "border-[#C9D2DE]/45 bg-[radial-gradient(circle_at_18%_8%,rgba(201,210,222,0.30),rgba(14,18,22,0.92)_45%),linear-gradient(180deg,rgba(16,20,25,0.96),rgba(9,12,15,0.98))] shadow-[0_0_0_1px_rgba(201,210,222,0.16),0_18px_36px_rgba(12,16,22,0.45)]",
    title: "text-[#EAF1F8]",
  },
};

export function HomeContent() {
  return (
    <main className="pb-20 pt-5 md:pb-24 md:pt-10">
      <HeroRecord />

      <div className="-mx-4 mt-14 sm:-mx-6 md:mt-20">
        <Marquee
          items={["Prod", "Rec", "Mix", "Master", "Bari", "Oro & Platino", "19.98"]}
          className="font-[var(--font-space)] text-5xl font-semibold uppercase text-white/10 [-webkit-text-stroke:1px_rgba(228,226,219,0.35)] sm:text-7xl md:text-8xl"
        />
        <Marquee
          reverse
          items={["Rap", "Trap", "Pop", "RnB", "Afrobeat", "Drill", "Urban", "Indie"]}
          className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-accent/80"
        />
      </div>

      <Scene chapter="Per chi" className="py-16 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Per chi suona</p>
          <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
            Per artisti, vocalist, producer e team che vogliono lavorare bene.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {audience.map((item) => (
            <ScrollCard key={item.title}>
              <TiltCard className="h-full rounded-3xl" max={7}>
                <article
                  className={`surface relative h-full overflow-hidden rounded-3xl p-6 ${
                    item.accent ? "border-accent/30 bg-accent/10" : ""
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{item.tag}</span>
                  <h3 className="mt-4 font-[var(--font-space)] text-2xl text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
                </article>
              </TiltCard>
            </ScrollCard>
          ))}
        </div>
      </Scene>

      <HomeServices />

      <Scene chapter="Il viaggio" className="relative">
        <HorizontalTrack
          label={
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Timeline · dal demo alla release</p>
              <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
                Il viaggio di un brano, dentro lo studio.
              </h2>
            </div>
          }
        >
          {songJourney.map((item) => (
            <TiltCard key={item.step} className="w-[78vw] shrink-0 rounded-3xl sm:w-[420px]" max={6}>
              <article className="surface relative flex h-[340px] flex-col justify-between overflow-hidden rounded-3xl p-7">
                <span className="absolute -right-4 -top-10 font-[var(--font-space)] text-[10rem] font-bold leading-none text-white/[0.04]">
                  {item.step}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Step {item.step}</span>
                <div>
                  <h3 className="font-[var(--font-space)] text-4xl text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
                </div>
              </article>
            </TiltCard>
          ))}
        </HorizontalTrack>
      </Scene>

      <Scene chapter="Oro & Platino" className="py-16 md:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Certificazioni</p>
              <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
                Lavori che hanno lasciato un segno anche fuori dallo studio.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
                La cura del suono conta quando arriva il momento di pubblicare. Qui sotto trovi
                release collegate al nostro lavoro in studio e certificate ufficialmente.
              </p>
            </Reveal>
            <div className="mt-6 space-y-3">
              {trustPoints.map((point, index) => (
                <Reveal key={point} delay={0.08 + index * 0.08}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-muted">
                    {point}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {certifications.map((item) => (
              <ScrollCard key={item.embedSrc} depth={1.3}>
                <TiltCard className="rounded-3xl" max={6} glow={tierStyles[item.tier].glow}>
                  <article className={`gold-sheen rounded-3xl border p-6 ${tierStyles[item.tier].card}`}>
                    <div className="flex items-center gap-4">
                      <div aria-hidden className={`vinyl h-12 w-12 shrink-0 rounded-full ${tierStyles[item.tier].disc}`} />
                      <h3 className={`font-[var(--font-space)] text-2xl ${tierStyles[item.tier].title}`}>
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/70">{item.detail}</p>
                    <div className="relative z-10 mt-5 overflow-hidden rounded-2xl border border-white/10">
                      <iframe
                        src={item.embedSrc}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title={item.title}
                      />
                    </div>
                  </article>
                </TiltCard>
              </ScrollCard>
            ))}
          </div>
        </div>
      </Scene>

      <Scene id="contatti" chapter="Contatti" className="pb-4 pt-10 md:pb-8 md:pt-14">
        <div className="surface overflow-hidden rounded-2xl border-white/[0.12] px-5 py-7 sm:rounded-[2rem] sm:px-6 sm:py-8 md:px-10 md:py-10">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Contatti</p>
            <h2 className="mt-3 font-[var(--font-space)] text-[1.875rem] sm:text-4xl md:text-5xl">
              Se hai un brano da registrare o finalizzare, possiamo partire da qui.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              Raccontaci cosa devi fare, che tipo di sessione ti serve e in che fase si trova il
              progetto. Ti aiutiamo a capire il servizio giusto e ad arrivare in studio con un
              piano chiaro.
            </p>
          </Reveal>
          <ContactsContent />
        </div>
      </Scene>

      <NextTrack
        href="/studio-registrazione-bari"
        number="02"
        title="Lo Studio"
        caption="Via Umberto Minervini 25 · Bari"
      />
    </main>
  );
}
