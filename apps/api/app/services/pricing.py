from dataclasses import dataclass
from pathlib import Path
import json
from sqlalchemy.orm import Session

from app.models.enums import ServiceType


@dataclass
class ServicePricing:
    label: str
    type: str
    price: int
    currency: str
    description: str
    active: bool = True


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


def get_service_config(service: ServiceType, db: Session | None = None) -> ServicePricing:
    raw = PRICING_DATA["services"][service.value]
    cfg = ServicePricing(
        label=raw["label"],
        type=raw["type"],
        price=raw["price"],
        currency=raw["currency"],
        description=raw["description"],
        active=True,
    )

    if db is not None:
        from app.models.pricing_override import PricingOverride
        override = db.get(PricingOverride, service.value)
        if override is not None:
            if override.price is not None:
                cfg.price = override.price
            cfg.active = override.active

    return cfg


def estimate_price(service: ServiceType, hours: int, db: Session | None = None) -> int:
    cfg = get_service_config(service, db=db)
    if cfg.type == "hourly":
        return cfg.price * hours
    return cfg.price


def get_merged_pricing(db: Session) -> dict:
    """Restituisce PRICING_DATA con override DB + servizi custom aggiuntivi."""
    from app.models.pricing_override import PricingOverride
    from app.models.custom_service import CustomService

    overrides: dict[str, PricingOverride] = {
        row.service_code: row
        for row in db.query(PricingOverride).all()
    }

    merged_services: dict[str, dict] = {}

    # Servizi di default dal JSON, con eventuali override
    for code, raw in PRICING_DATA["services"].items():
        entry = dict(raw)
        override = overrides.get(code)
        if override is not None:
            if override.price is not None:
                entry["price"] = override.price
            entry["active"] = override.active
        else:
            entry["active"] = True
        entry["is_custom"] = False
        merged_services[code] = entry

    # Servizi custom creati dall'admin
    custom_rows = db.query(CustomService).order_by(CustomService.sort_order, CustomService.code).all()
    for row in custom_rows:
        merged_services[row.code] = {
            "label": row.label,
            "type": row.service_type,
            "price": row.price,
            "currency": row.currency,
            "description": row.description,
            "active": row.active,
            "is_custom": True,
        }

    return {
        "services": merged_services,
        "workingHours": PRICING_DATA.get("workingHours", {}),
    }


def _local_pricing_path() -> Path:
    return Path(__file__).resolve().parents[1] / "data" / "pricing.json"


def save_as_default(db: Session) -> None:
    """
    Scrive i prezzi con override nel JSON (shared + locale) come nuovi default,
    poi elimina gli override dal DB e ricarica PRICING_DATA in memoria.
    """
    global PRICING_DATA

    from app.models.pricing_override import PricingOverride
    overrides: dict[str, PricingOverride] = {
        row.service_code: row
        for row in db.query(PricingOverride).all()
    }

    # Costruisce il nuovo dict services partendo dal JSON corrente
    new_services: dict[str, dict] = {}
    for code, raw in PRICING_DATA["services"].items():
        entry = dict(raw)
        override = overrides.get(code)
        if override is not None and override.price is not None:
            entry["price"] = override.price
        new_services[code] = entry

    new_data = {**PRICING_DATA, "services": new_services}

    # Scrive su entrambi i file JSON
    paths_to_write = [_shared_pricing_path(), _local_pricing_path()]
    for path in paths_to_write:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)

    # Cancella gli override di prezzo (lo stato active rimane nel DB)
    for override in overrides.values():
        override.price = None
    db.commit()

    # Aggiorna PRICING_DATA in-place: tutti i riferimenti importati vedono subito i nuovi valori
    fresh = load_pricing()
    PRICING_DATA.clear()
    PRICING_DATA.update(fresh)


def get_custom_service_price(code: str, hours: int, db: Session) -> int | None:
    """Calcola il prezzo di un servizio custom. Ritorna None se non trovato."""
    from app.models.custom_service import CustomService
    row = db.get(CustomService, code)
    if row is None:
        return None
    return row.price * hours if row.service_type == "hourly" else row.price
