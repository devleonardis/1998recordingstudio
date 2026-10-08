import type { MetadataRoute } from "next";

// Generated once at build time (static export).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "19.98 Recording Studio Bari",
    short_name: "19.98 Studio",
    description: "Studio di registrazione a Bari: produzione, recording, mix e master.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C1013",
    theme_color: "#0C1013",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
