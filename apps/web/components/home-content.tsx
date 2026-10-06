"use client";

import { motion } from "framer-motion";
import { ThinkingOrb } from "thinking-orbs";
import { HomeServices } from "@/components/home-services";
import { ContactsContent } from "@/components/contacts-content";
import { NextTrack } from "@/components/next-track";
import { Reveal, Scene, ScrollCard, TextGenerate } from "@/components/fx/reveal";
import { Magnetic, ParallaxOut, Spotlight, TiltCard, VelocitySkew } from "@/components/fx/interactive";
import { HorizontalTrack, Marquee } from "@/components/fx/stack";
import { Waveform } from "@/components/fx/canvas";

const easeOut = [0.22, 1, 0.36, 1] as const;

const whatsappUrl = "https://wa.me/393883739941";

const heroHighlights = [
  "Produzione, recording e finalizzazione in un unico spazio professionale.",
  "Supporto tecnico e artistico per far rendere meglio ogni sessione.",
  "Studio a Bari pensato per artisti, producer e team creativi.",
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
      <section data-chapter="Intro">
        <ParallaxOut>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(38,41,82,0.34),rgba(12,16,19,0.82)_48%),linear-gradient(180deg,rgba(12,16,19,0.9),rgba(12,16,19,0.98))] px-4 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-10 md:py-14">
            <Spotlight className="-left-10 -top-40 md:-left-32 md:-top-20" />
            <Waveform className="opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(205,121,72,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.06),transparent_18%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut }}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 py-1.5 pl-1.5 pr-4 text-[11px] uppercase tracking-[0.22em] text-accent"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30">
                    <ThinkingOrb state="listening" size={20} theme="dark" aria-label="Lo studio è in ascolto" />
                  </span>
                  In ascolto · Studio di registrazione a Bari
                </motion.div>
                <h1
                  id="home-hero-title"
                  className="mt-5 font-[var(--font-space)] text-[2.1rem] font-semibold leading-[0.96] text-white sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  <TextGenerate
                    text="Produzione, recording e mix con un suono curato davvero."
                    accentWords={["suono", "curato"]}
                    delay={0.15}
                  />
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, delay: 0.75, ease: easeOut }}
                  className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base md:text-lg"
                >
                  19.98 Recording Studio ti accompagna dalla sessione alla versione finale del brano:
                  riprese vocali e strumentali, direzione artistica, mix e master in uno spazio pensato
                  per lavorare bene e pubblicare con sicurezza.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9, ease: easeOut }}
                  className="mt-7 flex flex-col gap-3 sm:flex-row"
                >
                  <Magnetic>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="accent-hover w-full rounded-full border border-accent bg-accent px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] shadow-[0_14px_40px_rgba(205,121,72,0.28)] sm:inline-flex sm:w-auto sm:items-center sm:justify-center"
                    >
                      Contattaci su WhatsApp
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href="#servizi"
                      className="accent-hover hidden rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-text sm:inline-flex sm:items-center sm:justify-center"
                    >
                      Inizia il viaggio ↓
                    </a>
                  </Magnetic>
                </motion.div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {heroHighlights.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.6, delay: 1 + index * 0.08, ease: easeOut }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-muted backdrop-blur-sm"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.aside
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
              >
                <TiltCard className="rounded-2xl sm:rounded-[1.75rem]" max={7}>
                  <div className="surface relative overflow-hidden rounded-2xl border-white/12 p-5 sm:rounded-[1.75rem] sm:p-6">
                    <div aria-hidden className="vinyl absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-60 shadow-[0_0_60px_rgba(205,121,72,0.25)]" />
                    <p className="relative text-xs uppercase tracking-[0.22em] text-muted">A chi è rivolto</p>
                    <h2 className="relative mt-3 pr-16 font-[var(--font-space)] text-2xl text-white">
                      Per artisti, vocalist, producer e team che vogliono lavorare bene.
                    </h2>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-sm font-medium text-white">Artisti e vocalist</p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          Sessioni curate, take piu fluide e supporto in studio mentre registri.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-sm font-medium text-white">Producer e team</p>
                        <p className="mt-2 text-sm leading-6 text-muted">
                          Uno spazio pronto, affidabile e gia organizzato per lavorare senza perdere tempo.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-accent">Contatto diretto</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        WhatsApp: <span className="text-white">+39 388 3739941</span>
                      </p>
                      <p className="text-sm leading-6 text-muted">Via Umberto Minervini 25, Bari</p>
                    </div>
                  </div>
                </TiltCard>
              </motion.aside>
            </div>
          </div>
        </ParallaxOut>
      </section>

      <VelocitySkew className="-mx-4 mt-14 sm:-mx-6 md:mt-20">
        <Marquee
          items={["Prod", "Rec", "Mix", "Master", "Bari", "Oro & Platino", "19.98"]}
          className="font-[var(--font-space)] text-5xl font-semibold uppercase text-white/10 [-webkit-text-stroke:1px_rgba(228,226,219,0.35)] sm:text-7xl md:text-8xl"
        />
        <Marquee
          reverse
          items={["Rap", "Trap", "Pop", "RnB", "Afrobeat", "Drill", "Urban", "Indie"]}
          className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-accent/80"
        />
      </VelocitySkew>

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
        <div className="surface overflow-hidden rounded-2xl border-white/12 px-5 py-7 sm:rounded-[2rem] sm:px-6 sm:py-8 md:px-10 md:py-10">
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
