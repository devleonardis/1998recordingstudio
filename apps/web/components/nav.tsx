"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { JourneyLink } from "./fx/journey-link";
import { Magnetic } from "./fx/interactive";
import { StudioLogo } from "./logo";

const links = [
  { href: "/studio-registrazione-bari", label: "Studio" },
  { href: "/produzione-musicale", label: "Produzione" },
  { href: "/mix-master", label: "Mix & Master" },
  { href: "/blog", label: "Blog" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileLinks({ pathname }: { pathname: string }) {
  // transitions.dev "texts reveal": flip to .is-shown a frame after mount.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <nav aria-label="Menu mobile" className={`t-stagger flex flex-col gap-2 ${shown ? "is-shown" : ""}`}>
      {[{ href: "/", label: "Home" }, ...links].map((link, i) => (
        <JourneyLink
          key={link.href}
          href={link.href}
          style={{ transitionDelay: `${180 + i * 60}ms` }}
          className={`t-stagger-line flex items-baseline gap-4 border-b border-white/10 py-4 font-[var(--font-space)] text-4xl ${
            pathname === link.href ? "text-accent" : "text-white"
          }`}
        >
          <span className="font-mono text-xs text-muted">0{i + 1}</span>
          {link.label}
        </JourneyLink>
      ))}
    </nav>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const highlight = hovered ?? links.find((l) => isActive(pathname, l.href))?.href ?? null;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ viewTransitionName: "site-header" }}
        className="sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur-md"
      >
        <div className="mx-auto flex w-[min(1400px,calc(100%-2rem))] items-center justify-between gap-4 py-3 sm:w-[min(1400px,calc(100%-3rem))] md:py-4">
          <JourneyLink href="/" aria-label="Home" className="accent-hover flex items-center gap-3 rounded-full p-1">
            <StudioLogo />
            <span className="hidden font-[var(--font-space)] text-sm tracking-[0.08em] text-text/90 lg:inline">
              19.98 <span className="text-muted">Recording Studio</span>
            </span>
          </JourneyLink>

          <nav
            aria-label="Principale"
            className="relative hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <JourneyLink
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:translate-y-0 ${
                    active ? "text-white" : "text-muted hover:text-white"
                  }`}
                >
                  {highlight === link.href ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className={`absolute inset-0 rounded-full ${
                        active ? "bg-accent/20 ring-1 ring-accent/40" : "bg-white/[0.07]"
                      }`}
                    />
                  ) : null}
                  <span className="relative">{link.label}</span>
                </JourneyLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic>
              <a
                href="https://wa.me/393883739941"
                target="_blank"
                rel="noreferrer"
                className="accent-hover hidden rounded-full border border-accent bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.14em] text-accent md:inline-flex"
              >
                Whatsapp
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] md:hidden"
            >
              <span
                className={`absolute h-[1.5px] w-5 bg-text transition-transform duration-300 ${
                  open ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-[1.5px] w-5 bg-text transition-transform duration-300 ${
                  open ? "-rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-[radial-gradient(circle_at_80%_10%,rgba(205,121,72,0.22),transparent_45%),#090c0f] px-6 pb-10 pt-28 md:hidden"
          >
            <MobileLinks pathname={pathname} />
            <a
              href="https://wa.me/393883739941"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-accent bg-accent px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.14em] text-[#140d09]"
            >
              Scrivici su WhatsApp
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.a
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        href="https://wa.me/393883739941"
        target="_blank"
        rel="noreferrer"
        aria-label="Contattaci su WhatsApp"
        className="fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_28px_rgba(37,211,102,0.5)] transition-all hover:scale-110 hover:shadow-[0_4px_36px_rgba(37,211,102,0.7)] active:scale-95 md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="white" width="26" height="26" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </motion.a>
    </>
  );
}
