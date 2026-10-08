"use client";

import { usePathname } from "next/navigation";

function roomFor(pathname: string) {
  if (pathname.startsWith("/studio-registrazione-bari")) return "studio";
  if (pathname.startsWith("/produzione-musicale")) return "produzione";
  if (pathname.startsWith("/mix-master")) return "mix";
  if (pathname.startsWith("/blog")) return "blog";
  if (pathname.startsWith("/prenota")) return "prenota";
  return "intro";
}

/**
 * The page background is the studio itself: an acoustic diffuser wall made
 * of the logo's cube, lit by a key and a fill light that drift as you scroll
 * and change temperature with every track. Pure CSS (root scroll timeline).
 */
export function StudioRoom() {
  const pathname = usePathname();
  return (
    <div aria-hidden className="studio-room" data-room={roomFor(pathname)}>
      <div className="room-wall" />
      <div className="room-light room-light--key" />
      <div className="room-light room-light--fill" />
      <div className="room-floor" />
    </div>
  );
}
