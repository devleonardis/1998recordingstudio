"use client";

import { useSearchParams } from "next/navigation";
import { BookingCalendar } from "@/components/booking-calendar";
import { findBookingSelection } from "@/lib/booking";

/** Static export has no request-time searchParams: read `?servizio=` in the browser instead. */
export function BookingCalendarFromQuery() {
  const servizio = useSearchParams().get("servizio") ?? undefined;
  return <BookingCalendar initial={findBookingSelection(servizio)} />;
}
