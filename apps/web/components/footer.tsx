import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 py-10 text-center text-sm text-muted">
      <p>1998 Recording Studio · Bari, Italy</p>
      <p className="mt-2">19.98recordingstudio@gmail.com · +39 388 3739941</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted/80">
        <a href="https://www.devleonardis.com" target="_blank" rel="noreferrer" className="hover:text-accent">
          Powered by DevLeonardis
        </a>
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted/60">
        <Link href="/admin" className="hover:text-accent">
          Studio Control
        </Link>
      </p>
    </footer>
  );
}
