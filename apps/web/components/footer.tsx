"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="mt-24 border-t border-white/10 py-10 text-center text-sm text-muted"
    >
      <p>1998 Recording Studio · Bari, Italy</p>
      <p className="mt-2">19.98recordingstudio@gmail.com · +39 388 3739941</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted/80">
        <a href="https://www.devleonardis.com" target="_blank" rel="noreferrer" className="hover:text-accent">
          Powered by DevLeonardis
        </a>
      </p>
    </motion.footer>
  );
}
