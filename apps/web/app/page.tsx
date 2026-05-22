import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";

export const metadata: Metadata = {
  title: "Studio di Registrazione Bari | 19.98 Studio — Prod, Rec, Mix & Master",
  description:
    "19.98 Recording Studio a Bari: produzione musicale, recording, mix e master professionali. Dischi d'oro certificati. Prenota la tua sessione online. Via Umberto Minervini 25.",
  keywords: [
    "studio di registrazione Bari",
    "studio recording Bari",
    "registrare musica Bari",
    "mix e master Bari",
    "produzione musicale Bari",
    "noleggio studio Bari",
    "studio rap Bari",
    "studio trap Bari",
    "beatmaker Bari",
    "incidere un brano Bari",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Studio di Registrazione Bari | 19.98 Studio — Prod, Rec, Mix & Master",
    description:
      "Produzione, recording, mix e master a Bari. Studio professionale con dischi d'oro certificati. Prenota online.",
    url: "/",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "19.98 Recording Studio Bari — Studio di registrazione professionale",
      },
    ],
  },
  twitter: {
    title: "Studio di Registrazione Bari | 19.98 Studio",
    description: "Produzione, recording, mix e master a Bari. Prenota la tua sessione online.",
    images: ["/og-image.jpg"],
  },
};

export default function HomePage() {
  return <HomeContent />;
}
