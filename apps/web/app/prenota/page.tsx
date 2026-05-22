import type { Metadata } from "next";
import { PrenotaContent } from "./prenota-content";

export const metadata: Metadata = {
  title: "Prenota la tua Sessione | 19.98 Recording Studio Bari",
  description:
    "Prenota online la tua sessione al 19.98 Recording Studio di Bari. Scegli il servizio, la data e lo slot disponibile. Risposta entro 24 ore.",
  alternates: { canonical: "/prenota" },
  openGraph: {
    title: "Prenota la tua Sessione | 19.98 Recording Studio Bari",
    description:
      "Prenota online la tua sessione al 19.98 Recording Studio di Bari. Scegli il servizio, la data e lo slot disponibile. Risposta entro 24 ore.",
    url: "/prenota",
  },
};

export default function PrenotaPage() {
  return <PrenotaContent />;
}
