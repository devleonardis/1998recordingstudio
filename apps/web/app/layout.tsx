import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.1998recordingstudio.it";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1013",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "19.98 Recording Studio Bari | Studio di Registrazione Professionale",
    template: "%s | 19.98 Recording Studio Bari",
  },
  description:
    "Studio di registrazione professionale a Bari. Produzione musicale, recording, mix e master con risultati certificati. Via Umberto Minervini 25 — prenota online.",
  keywords: [
    "studio di registrazione Bari",
    "studio recording Bari",
    "mix e master Bari",
    "produzione musicale Bari",
    "registrare musica Bari",
    "studio musicale Bari",
    "noleggio studio Bari",
    "studio rap Bari",
    "beatmaker Bari",
    "fonico Bari",
    "sala di registrazione Bari",
    "mix master online",
    "produzione musicale professionale",
    "engineer del suono Bari",
  ],
  authors: [{ name: "19.98 Recording Studio" }],
  creator: "19.98 Recording Studio",
  publisher: "19.98 Recording Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "19.98 Recording Studio Bari",
    title: "19.98 Recording Studio Bari | Studio di Registrazione Professionale",
    description:
      "Studio di registrazione professionale a Bari. Produzione musicale, recording, mix e master.",
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
    card: "summary_large_image",
    title: "19.98 Recording Studio Bari | Studio di Registrazione Professionale",
    description:
      "Studio di registrazione professionale a Bari. Recording, mix e master con risultati certificati.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "music",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["MusicStore", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: "19.98 Recording Studio",
  alternateName: ["1998 Recording Studio Bari", "19.98 Studio"],
  description:
    "Studio di registrazione professionale a Bari. Produzione musicale, recording, mix e master con risultati certificati. Dischi d'oro al merito.",
  url: SITE_URL,
  telephone: "+393883739941",
  email: "19.98recordingstudio@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Via Umberto Minervini 25",
    addressLocality: "Bari",
    addressRegion: "BA",
    postalCode: "70124",
    addressCountry: "IT",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.1177,
    longitude: 16.8512,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:00",
    },
  ],
  priceRange: "€€",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servizi di registrazione musicale",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Recording",
        description:
          "Sessioni vocali e strumentali con supporto tecnico professionale in studio",
      },
      {
        "@type": "Offer",
        name: "Produzione Musicale",
        description:
          "Direzione artistica e costruzione del brano: concept, arrangiamento, sound design",
      },
      {
        "@type": "Offer",
        name: "Mix e Master",
        description:
          "Bilanciamento e ottimizzazione per la distribuzione su piattaforme streaming",
      },
      {
        "@type": "Offer",
        name: "Noleggio Studio",
        description:
          "Spazio professionale per producer e team creativi con setup operativo incluso",
      },
    ],
  },
  knowsAbout: [
    "Produzione musicale",
    "Recording professionale",
    "Mix e master",
    "DAW",
    "Fonico",
    "Engineer del suono",
    "Missaggio",
    "Mastering",
    "Rap",
    "Trap",
    "Musica italiana",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </body>
    </html>
  );
}
