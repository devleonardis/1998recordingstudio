import pricing from "../data/pricing.json";

export type ServiceCode = "prod" | "rec" | "noleggio" | "mixmaster";
export type PricingKind = "fixed" | "hourly";

export interface ServicePricing {
  label: string;
  type: PricingKind;
  price: number;
  currency: "EUR";
  description: string;
}

export interface PricingData {
  services: Record<ServiceCode, ServicePricing>;
  workingHours: {
    start: string;
    end: string;
  };
}

export const PRICING = pricing as PricingData;

export const SERVICE_ORDER: ServiceCode[] = ["prod", "rec", "mixmaster", "noleggio"];

export function estimatePrice(service: ServiceCode, hours = 1): number {
  const serviceConfig = PRICING.services[service];
  return serviceConfig.type === "hourly" ? serviceConfig.price * hours : serviceConfig.price;
}
