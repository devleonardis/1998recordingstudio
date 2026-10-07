/**
 * Online booking runs on Cal.com: availability, Google Calendar sync,
 * confirmation emails and Stripe payments all live there. The site only
 * embeds it. Every service below must exist on Cal.com as an event type
 * with the same slug (Cal.com → Event Types → URL).
 */

/** Cal.com username — the `xxx` in cal.com/xxx. */
export const CAL_USERNAME = process.env.NEXT_PUBLIC_CAL_USERNAME ?? "main-19.98-recording-studio-ifvkeg";

export type BookingOption = {
  /** Cal.com event type slug (Cal.com → Event Types → URL). */
  slug: string;
  /** Duration label shown on the hour picker, e.g. "2h". */
  label: string;
  minutes: number;
  price: number;
};

export type BookingService = {
  /** Used as `/prenota?servizio=<id>`. */
  id: string;
  code: string;
  title: string;
  caption: string;
  /**
   * Cal.com charges one fixed price per event type, so services sold by the
   * hour are one event type per duration.
   */
  options: BookingOption[];
};

const hourly = (prefix: string, perHour: number, hours: number[]): BookingOption[] =>
  hours.map((h) => ({ slug: `${prefix}-${h}h`, label: `${h}h`, minutes: h * 60, price: perHour * h }));

export const BOOKING_SERVICES: BookingService[] = [
  {
    id: "recording",
    code: "REC",
    title: "Rec",
    caption: "50 € l'ora, da 1 a 4 ore con fonico",
    options: hourly("rec", 50, [1, 2, 3, 4]),
  },
  {
    id: "rec-mix-master",
    code: "RMM",
    title: "Rec + Mix & Master",
    caption: "150 € · 2 ore: registri ed esci con il brano finito",
    options: [{ slug: "rec-mix-master", label: "2h", minutes: 120, price: 150 }],
  },
  {
    id: "sessione-completa",
    code: "ALL",
    title: "Sessione completa",
    caption: "330 € · 4 ore: produzione, rec, mix e master",
    options: [{ slug: "sessione-completa", label: "4h", minutes: 240, price: 330 }],
  },
  {
    id: "produzione",
    code: "PRD",
    title: "Produzione",
    caption: "200 € · 2 ore: beat, arrangiamento, direzione artistica",
    options: [{ slug: "produzione", label: "2h", minutes: 120, price: 200 }],
  },
  {
    id: "mix-master",
    code: "MIX",
    title: "Mix & Master",
    caption: "110 € · mix e master di tracce già registrate",
    options: [{ slug: "mix-master", label: "1h", minutes: 60, price: 110 }],
  },
  {
    id: "noleggio-sala",
    code: "RNT",
    title: "Noleggio sala",
    caption: "35 € l'ora, per te e il tuo team",
    options: hourly("noleggio", 35, [1, 2, 3, 4, 8]),
  },
];

export type BookingSelection = { service: BookingService; option: BookingOption };

/** Accepts a service id or a specific event slug (e.g. `rec-2h`). */
export function findBookingSelection(param: string | undefined): BookingSelection {
  for (const service of BOOKING_SERVICES) {
    const option = service.options.find((o) => o.slug === param);
    if (option) return { service, option };
  }
  const service = BOOKING_SERVICES.find((s) => s.id === param) ?? BOOKING_SERVICES[0];
  return { service, option: service.options[0] };
}
