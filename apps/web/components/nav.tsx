"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { JourneyLink } from "./fx/journey-link";
import { Magnetic } from "./fx/interactive";
import { StudioLogo } from "./logo";
import { SleeveMenu } from "./sleeve-menu";

const links = [
  { href: "/studio-registrazione-bari", label: "Studio" },
  { href: "/produzione-musicale", label: "Produzione" },
  { href: "/mix-master", label: "Mix & Master" },
  { href: "/blog", label: "Blog" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop links with a pill that slides under the hovered / current one. */
function PillNav({ pathname }: { pathname: string }) {
  const navRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const activeHref = links.find((l) => isActive(pathname, l.href))?.href ?? null;
  const target = hovered ?? activeHref;

  useLayoutEffect(() => {
    const el = target ? navRef.current?.querySelector<HTMLElement>(`[data-href="${target}"]`) : null;
    setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [target]);

  return (
    <nav
      ref={navRef}
      aria-label="Principale"
      className="relative hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      <span
        aria-hidden
        className={`absolute bottom-1 top-1 rounded-full transition-[left,width,opacity,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pill ? "opacity-100" : "opacity-0"
        } ${hovered && hovered !== activeHref ? "bg-white/[0.08]" : "bg-accent/20 ring-1 ring-accent/40"}`}
        style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
      />
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <JourneyLink
            key={link.href}
            href={link.href}
            data-href={link.href}
            onMouseEnter={() => setHovered(link.href)}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:translate-y-0 ${
              active ? "text-white" : "text-muted hover:text-white"
            }`}
          >
            {link.label}
          </JourneyLink>
        );
      })}
    </nav>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        style={{ viewTransitionName: "site-header" }}
        className="intro-in sticky top-0 z-50 border-b border-white/10 bg-bg/90 backdrop-blur-md"
      >
        <div className="mx-auto flex w-[min(1400px,calc(100%-2rem))] items-center justify-between gap-4 py-3 sm:w-[min(1400px,calc(100%-3rem))] md:py-4">
          <JourneyLink href="/" aria-label="Home" className="accent-hover flex items-center gap-3 rounded-full p-1">
            <StudioLogo />
            <span className="hidden font-[var(--font-space)] text-sm tracking-[0.08em] text-text/90 lg:inline">
              19.98 <span className="text-muted">Recording Studio</span>
            </span>
          </JourneyLink>

          <PillNav pathname={pathname} />

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
            <Magnetic strength={0.25}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded={open}
                aria-label="Apri menu"
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] hover:translate-y-0 hover:border-accent/60"
              >
                {/* Lines fold away into a tiny spinning record on hover */}
                <span aria-hidden className="menu-disc absolute inset-[10px] scale-50 rounded-full opacity-0 transition-[opacity,transform] duration-300 group-hover:scale-100 group-hover:opacity-100" />
                <span className="absolute h-[1.5px] w-5 -translate-y-[4px] bg-text transition-[transform,opacity] duration-300 group-hover:-translate-y-[9px] group-hover:opacity-0" />
                <span className="absolute h-[1.5px] w-5 translate-y-[4px] bg-text transition-[transform,opacity] duration-300 group-hover:translate-y-[9px] group-hover:opacity-0" />
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      <SleeveMenu open={open} onClose={close} />

      <a
        href="https://wa.me/393883739941"
        target="_blank"
        rel="noreferrer"
        aria-label="Contattaci su WhatsApp"
        className="intro-in fixed bottom-[88px] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_28px_rgba(37,211,102,0.5)] [animation-delay:0.3s] hover:scale-110 hover:shadow-[0_4px_36px_rgba(37,211,102,0.7)] active:scale-95 md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="white" width="24" height="24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </>
  );
}
