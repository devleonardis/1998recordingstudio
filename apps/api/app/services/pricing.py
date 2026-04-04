from dataclasses import dataclass
from pathlib import Path
import json
from app.models.enums import ServiceType


@dataclass
class ServicePricing:
    label: str
    type: str
    price: int
    currency: str
    description: str


def _shared_pricing_path() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        shared = parent / "packages" / "shared" / "data" / "pricing.json"
        if shared.exists():
            return shared

    local_fallback = current.parents[1] / "data" / "pricing.json"
    return local_fallback


def load_pricing() -> dict:
    path = _shared_pricing_path()
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


PRICING_DATA = load_pricing()


def get_service_config(service: ServiceType) -> ServicePricing:
    raw = PRICING_DATA["services"][service.value]
    return ServicePricing(**raw)


def estimate_price(service: ServiceType, hours: int) -> int:
    cfg = get_service_config(service)
    if cfg.type == "hourly":
        return cfg.price * hours
    return cfg.price
