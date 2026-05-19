"""
Sincronizza eventi Google Calendar → booking confermati nel DB.

Formato titolo atteso: 'FONICO - ARTISTA SERVICE_KW'
  es. "SVG - GIORGIO SESSION COMPLETA"
      "NARDI - N. TURSI RMM"
      "NARDI - MONDÈ REC"

Gli eventi di blocco (es. "nardi non disponibile") vengono scartati.
"""
from __future__ import annotations

import json
import re
from datetime import date, timedelta
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus, ServiceType
from app.services.google_calendar import list_events_in_range, _parse_event_datetime, _tz

logger = logging.getLogger(__name__)

PLACEHOLDER_EMAIL = "noreply@1998studio.local"

# ---------------------------------------------------------------------------
# Prezzi di fallback (hardcoded) — usati quando non c'è una description
# strutturata e il prezzo non è altrimenti calcolabile.
# ---------------------------------------------------------------------------
_PRICE_PER_HOUR_REC: int = 50        # €/ora per sessioni REC
_PRICE_MIXMASTER: int = 100          # prezzo fisso mix/master
_PRICE_PROD: int = 200               # prezzo fisso produzione
_PRICE_SESSION_COMPLETA: int = 350   # pacchetto completo 6h
_PRICE_RMM: int = 150                # REC + Mix + Master

# ---------------------------------------------------------------------------
# Pattern per eventi di "blocco" (non prenotazioni reali)
# ---------------------------------------------------------------------------
_BLOCK_RE = re.compile(
    r"\b(non\s+disponibile|indisponibile|pausa|blocco|assente|ferie|"
    r"chiuso|chiusa|vacation|holiday|unavailable)\b",
    re.I,
)

# ---------------------------------------------------------------------------
# Parole chiave di servizio (ordine: più specifiche prima)
# ---------------------------------------------------------------------------
_SERVICE_KW_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bsession\s+completa\b", re.I),           "SESSION COMPLETA"),
    (re.compile(r"\brmm\b", re.I),                           "RMM"),
    (re.compile(r"\bmix\s*[&e]\s*master\b|\bmixmaster\b", re.I), "MIX & MASTER"),
    (re.compile(r"\bmaster\b", re.I),                        "MASTER"),
    (re.compile(r"\bproduzione\b|\bprod\b", re.I),          "PROD"),
    (re.compile(r"\bmix\b", re.I),                           "MIX"),
    (re.compile(r"\brec\b|\brecording\b", re.I),            "REC"),
    (re.compile(r"\bnoleggio\b", re.I),                      "NOLEGGIO"),
]


# ---------------------------------------------------------------------------
# Funzioni pubbliche / helper (esportate anche per i test)
# ---------------------------------------------------------------------------

def _is_block_event(summary: str) -> bool:
    """True se il titolo indica un'indisponibilità, non una sessione reale."""
    return bool(_BLOCK_RE.search(summary))


def _parse_title(summary: str) -> tuple[str, str, str]:
    """
    Parsa il titolo in formato 'FONICO - ARTISTA SERVICE_KW'.

    Ritorna (engineer, artist, service_keyword_normalizzata).
    Se non c'è il separatore ' - ' il fonico è stringa vuota.
    """
    if " - " in summary:
        engineer, rest = summary.split(" - ", 1)
        engineer = engineer.strip()
    else:
        engineer = ""
        rest = summary.strip()

    service_kw = ""
    artist = rest.strip()

    for pattern, kw in _SERVICE_KW_PATTERNS:
        matches = list(pattern.finditer(rest))
        if matches:
            m = matches[-1]          # ultima occorrenza nel testo
            service_kw = kw
            artist = rest[: m.start()].strip()
            break

    return engineer, artist, service_kw


def _detect_service_and_price(service_kw: str, hours: int) -> tuple[ServiceType, int]:
    """
    Dato il service_kw (normalizzato da _parse_title) e le ore,
    ritorna (ServiceType, prezzo_totale).
    """
    kw = service_kw.upper()
    if kw == "SESSION COMPLETA":
        return ServiceType.REC, _PRICE_SESSION_COMPLETA
    if kw == "RMM":
        return ServiceType.MIXMASTER, _PRICE_RMM
    if kw in ("REC", "RECORDING"):
        return ServiceType.REC, _PRICE_PER_HOUR_REC * hours
    if kw in ("MIX", "MASTER", "MIX & MASTER", "MIXMASTER"):
        return ServiceType.MIXMASTER, _PRICE_MIXMASTER
    if kw in ("PROD", "PRODUZIONE"):
        return ServiceType.PROD, _PRICE_PROD
    if kw == "NOLEGGIO":
        return ServiceType.NOLEGGIO, 0
    # Nessuna parola chiave riconosciuta → fallback generico
    return ServiceType.NOLEGGIO, 0


def _extract_field(description: str, key: str, default: str = "") -> str:
    """Estrae 'Value' da 'Key: Value\\n' nella description strutturata."""
    match = re.search(rf"^{re.escape(key)}:\s*(.+)$", description, re.MULTILINE)
    return match.group(1).strip() if match else default


def _parse_price(raw: str) -> int:
    """Converte '150 EUR' o '200' in intero; '0' / stringa vuota → 0."""
    cleaned = re.sub(r"[^\d]", "", raw)
    return int(cleaned) if cleaned else 0


# ---------------------------------------------------------------------------
# Funzione principale
# ---------------------------------------------------------------------------

def sync_calendar_to_db(db: Session, days_ahead: int = 365) -> dict:
    """
    Importa eventi futuri dal Google Calendar nel DB come sessioni CONFIRMED.
    Ritorna un dict con contatori {imported, skipped, errors}.
    """
    today = date.today()
    end_date = today + timedelta(days=days_ahead)
    events = list_events_in_range(today, end_date)

    # Indice degli event_id già presenti nel DB (deduplicazione)
    existing_ids: set[str] = set(
        row[0]
        for row in db.execute(
            select(Booking.google_event_id).where(Booking.google_event_id.isnot(None))
        ).all()
    )

    imported = 0
    skipped = 0
    errors = 0
    local_tz = _tz()

    for event in events:
        # Salta eventi annullati da Google
        if event.get("status") == "cancelled":
            continue

        event_id: str = event.get("id", "")
        if not event_id:
            skipped += 1
            continue

        summary: str = event.get("summary", "Sessione")

        # ── Salta blocchi di indisponibilità ───────────────────────────────
        if _is_block_event(summary):
            skipped += 1
            continue

        # ── Già in DB → skip ───────────────────────────────────────────────
        if event_id in existing_ids:
            skipped += 1
            continue

        try:
            raw_start = event.get("start", {})
            raw_end = event.get("end", {})
            start_dt = _parse_event_datetime(raw_start)
            end_dt = _parse_event_datetime(raw_end)
            if not start_dt or not end_dt or start_dt >= end_dt:
                skipped += 1
                continue

            # Normalizza in timezone locale
            start_local = start_dt.astimezone(local_tz).replace(tzinfo=None)
            end_local = end_dt.astimezone(local_tz).replace(tzinfo=None)
            hours = max(1, round((end_local - start_local).total_seconds() / 3600))

            description: str = (event.get("description") or "").replace("\\n", "\n")

            # ── Evento strutturato (creato dall'app) ───────────────────────
            struct_customer = _extract_field(description, "Cliente")
            struct_artist = _extract_field(description, "Artista")

            if struct_customer or struct_artist:
                artist_name = struct_artist or summary
                customer_name = struct_customer or summary
                phone = _extract_field(description, "Telefono") or "-"
                engineer_name = _extract_field(description, "Fonico")
                price = _parse_price(_extract_field(description, "Prezzo"))
                # Tipo servizio dal campo Pacchetto se disponibile
                pkg = _extract_field(description, "Pacchetto").lower()
                if "mix" in pkg or "master" in pkg:
                    service = ServiceType.MIXMASTER
                elif "prod" in pkg:
                    service = ServiceType.PROD
                elif "noleggio" in pkg:
                    service = ServiceType.NOLEGGIO
                else:
                    service = ServiceType.REC
            else:
                # ── Evento inserito manualmente → parsing del titolo ───────
                engineer_name, artist, service_kw = _parse_title(summary)
                artist_name = artist or summary
                customer_name = artist or summary
                phone = "-"
                service, price = _detect_service_and_price(service_kw, hours)

            # Metadati interni nelle note
            meta = json.dumps(
                {"engineer_name": engineer_name, "artist_name": artist_name},
                ensure_ascii=True,
            )
            notes = f"[importato da Google Calendar]\n\n[BOOKING_META]{meta}"

            booking = Booking(
                service=service,
                date=start_local.date(),
                start_time=start_local.time(),
                hours=hours,
                price_total=price,
                customer_name=customer_name,
                email=PLACEHOLDER_EMAIL,
                phone=phone,
                notes=notes,
                status=BookingStatus.CONFIRMED,
                google_event_id=event_id,
            )
            db.add(booking)
            db.commit()
            db.refresh(booking)
            existing_ids.add(event_id)
            imported += 1

        except Exception as exc:
            logger.exception("Error importing event %s: %s", event_id, exc)
            db.rollback()
            errors += 1

    return {"imported": imported, "skipped": skipped, "errors": errors}
