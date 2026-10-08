"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";
import { SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { BrandLockup, CubeMark } from "./brand-logo";
import { Magnetic } from "./fx/interactive";

const whatsappUrl = "https://wa.me/393883739941";

const heroHighlights = [
  "Produzione, recording e finalizzazione in un unico spazio professionale.",
  "Supporto tecnico e artistico per far rendere meglio ogni sessione.",
  "Studio a Bari pensato per artisti, producer e team creativi.",
] as const;

/**
 * The album in your hands: a sleeve whose cover art is a live shader, and the
 * record that slides out of it as you scroll (pinned on desktop). The title
 * is set letter by letter with SplitText.
 */
export function HeroRecord() {
  const root = useRef<HTMLElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    setWide(window.matchMedia("(min-width: 1024px)").matches);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const vinyl = q(".hero-vinyl");
      gsap.set(vinyl, { xPercent: 24 });
      if (prefersReducedMotion()) return;

      const split = SplitText.create(q(".hero-title"), { type: "words,chars", mask: "words" });

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(split.chars, { yPercent: 115, rotateX: -70, duration: 1.3, stagger: 0.016 }, 0.1)
        .from(q(".hero-sleeve"), { y: 140, rotate: 10, autoAlpha: 0, duration: 1.5 }, 0.15)
        .from(vinyl, { xPercent: 0, rotate: -240, duration: 2 }, 0.55)
        .from(q(".hero-fade"), { y: 26, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.55);

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top+=73", end: "+=85%", pin: true, scrub: 0.8 },
          })
          .to(vinyl, { xPercent: 64, rotate: "+=600", ease: "none" }, 0)
          .to(q(".hero-sleeve"), { xPercent: -14, rotateY: 22, scale: 0.9, ease: "none" }, 0)
          .to(q(".hero-copy"), { yPercent: -10, autoAlpha: 0.25, ease: "none" }, 0.45);
      });
      mm.add("(max-width: 1023px)", () => {
        gsap.to(vinyl, {
          xPercent: 62,
          rotate: "+=420",
          ease: "none",
          scrollTrigger: { trigger: q(".hero-sleeve-wrap")[0], start: "top 85%", end: "bottom 15%", scrub: 0.6 },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-chapter="Intro"
      className="relative overflow-hidden py-8 sm:py-10 lg:flex lg:min-h-[calc(100svh-110px)] lg:items-center lg:py-12"
    >

      <div className="relative grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="hero-copy max-w-3xl">
          <div className="hero-fade inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 py-1.5 pl-1.5 pr-4 text-[11px] uppercase tracking-[0.22em] text-accent">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/30">
              <ThinkingOrb state="listening" size={20} theme="dark" aria-label="Lo studio è in ascolto" />
            </span>
            In ascolto · Studio di registrazione a Bari
          </div>

          <h1
            id="home-hero-title"
            className="hero-title mt-5 font-[var(--font-space)] text-[2.4rem] font-semibold leading-[0.95] tracking-tight text-white [perspective:600px] sm:text-6xl lg:text-7xl xl:text-[5.4rem]"
          >
            Produzione, recording e mix con un <span className="text-[#E9A577]">suono curato</span> davvero.
          </h1>

          <p className="hero-fade mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base md:text-lg">
            19.98 Recording Studio ti accompagna dalla sessione alla versione finale del brano:
            riprese vocali e strumentali, direzione artistica, mix e master in uno spazio pensato
            per lavorare bene e pubblicare con sicurezza.
          </p>

          <div className="hero-fade mt-7 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="accent-hover w-full rounded-full border border-accent bg-accent px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.14em] text-[#140d09] shadow-[0_14px_40px_rgba(212,133,58,0.28)] sm:inline-flex sm:w-auto sm:items-center sm:justify-center"
              >
                Contattaci su WhatsApp
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#servizi"
                className="accent-hover hidden rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-sm uppercase tracking-[0.14em] text-text sm:inline-flex sm:items-center sm:justify-center"
              >
                Metti il disco ↓
              </a>
            </Magnetic>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item}
                className="hero-fade rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* The album: sleeve in front, record sliding out to the right */}
        <div className="hero-sleeve-wrap relative mx-auto aspect-square w-[min(74vw,460px)] [perspective:1200px] lg:mr-[20%]">
          <div className="hero-vinyl absolute inset-[3%] z-0">
            <div className="vinyl-spin relative h-full w-full">
              <div className="sleeve-grooves absolute inset-0 rounded-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
              <div className="absolute inset-[33%] flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f3c9a6,#d4853a_45%,#7a3e1d)] text-center text-[#140d09]">
                <CubeMark className="h-[34%] w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
                <span className="mt-1 font-mono text-[clamp(6px,0.9vw,9px)] uppercase tracking-[0.2em]">Lato A · 33⅓</span>
              </div>
              <div className="absolute left-1/2 top-1/2 h-[3%] w-[3%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#07090b]" />
            </div>
          </div>

          <div className="hero-sleeve absolute inset-0 z-10 overflow-hidden rounded-md border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.65)]">
            <MeshGradient
              className="!absolute inset-0"
              colors={["#090d18", "#1d1b3a", "#d4853a", "#262952", "#f3c9a6"]}
              distortion={0.9}
              swirl={0.45}
              grainOverlay={0.4}
              speed={0.3}
              maxPixelCount={wide ? 500_000 : 220_000}
              minPixelRatio={1}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(9,13,24,0.1),rgba(9,13,24,0.72)_78%)]" />
            <div className="absolute inset-0 flex flex-col p-5 sm:p-7">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/75">
                <span>LP · Bari</span>
                <span>Stereo</span>
              </div>
              <BrandLockup
                className="m-auto [&_.brand-numerals]:text-3xl sm:[&_.brand-numerals]:text-5xl"
                cubeClassName="h-[clamp(80px,20vw,150px)] w-auto"
              />
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
                Prod · Rec · Mix · Master
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
