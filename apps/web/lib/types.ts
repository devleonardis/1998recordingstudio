export type ServiceCode = "prod" | "rec" | "noleggio" | "mixmaster";

export interface BookingItemPayload {
  service: ServiceCode;
  hours: number;
}

export interface BookingPayload {
  service?: ServiceCode;
  items?: BookingItemPayload[];
  date: string;
  start_time: string;
  hours: number;
  studio_hours?: number;
  customer_name: string;
  engineer_name?: string;
  artist_name?: string;
  phone: string;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
  price_total: number;
}
