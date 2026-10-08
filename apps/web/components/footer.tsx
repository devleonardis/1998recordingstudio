import { BrandLockup } from "./brand-logo";

export function Footer() {
  return (
    <footer className="sd-reveal mt-24 border-t border-white/10 py-10 text-center text-sm text-muted">
      <BrandLockup className="mx-auto mb-8 w-fit" cubeClassName="h-16 w-auto" />
      <p>Via Umberto Minervini 25 · Bari, Italy</p>
      <p className="mt-2">19.98recordingstudio@gmail.com · +39 388 3739941</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted/80">
        <a href="https://www.devleonardis.com" target="_blank" rel="noreferrer" className="hover:text-accent">
          Powered by DevLeonardis
        </a>
      </p>
    </footer>
  );
}
