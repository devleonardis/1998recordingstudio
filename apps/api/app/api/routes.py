from datetime import date as date_type
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.admin_user import AdminUser
from app.models.booking import Booking
from app.models.enums import BookingStatus, ServiceType
from app.schemas.auth import Token
from app.schemas.booking import (
    AdminBookingsResponse,
    AdminPricingResponse,
    AvailabilityResponse,
    BookingItem,
    BookingCreate,
    BookingOut,
    BookingPublicResponse,
    BookingStatusUpdate,
    CustomServiceCreate,
    PricingServiceOut,
    PricingUpdate,
    UpcomingSessionsResponse,
)
from app.services.availability import in_working_hours, list_available_slots, validate_slot_available
from app.services.calendar_sync import sync_calendar_to_db
from app.services.google_calendar import create_event_for_booking, delete_event, is_enabled as google_calendar_enabled
from app.services.notifications import send_booking_emails
from app.services.pricing import PRICING_DATA, estimate_price, get_custom_service_price, get_merged_pricing, get_service_config, save_as_default
from app.models.pricing_override import PricingOverride
from app.models.custom_service import CustomService

router = APIRouter()
logger = logging.getLogger(__name__)


PACKAGE_TAG = "[PACKAGE_JSON]"
META_TAG = "[BOOKING_META]"
STUDIO_HOURS_BOOST = {
    ServiceType.PROD: 3,
    ServiceType.MIXMASTER: 2,
}
PLACEHOLDER_EMAIL = "noreply@1998studio.local"


def _extract_package_items(notes: str | None) -> list[BookingItem] | None:
    if not notes:
        return None
    try:
        encoded = None
        for line in notes.splitlines():
            if line.startswith(PACKAGE_TAG):
                encoded = line[len(PACKAGE_TAG) :].strip()
                break
        if not encoded and PACKAGE_TAG in notes:
            encoded = notes.split(PACKAGE_TAG, 1)[1].strip()
        if not encoded:
            return None
        raw = json.loads(encoded)
        return [BookingItem(service=item["service"], hours=item["hours"]) for item in raw]
    except Exception:
        return None


def _extract_booking_meta(notes: str | None) -> dict[str, str] | None:
    if not notes:
        return None
    try:
        encoded = None
        for line in notes.splitlines():
            if line.startswith(META_TAG):
                encoded = line[len(META_TAG) :].strip()
                break
        if not encoded:
            return None
        raw = json.loads(encoded)
        if not isinstance(raw, dict):
            return None
        return {str(k): str(v) for k, v in raw.items() if isinstance(v, str) and v.strip()}
    except Exception:
        return None


def _extract_user_notes(notes: str | None) -> str | None:
    if not notes:
        return None
    if PACKAGE_TAG in notes:
        return notes.split(PACKAGE_TAG, 1)[0].strip() or None
    return notes.strip() or None


def _compose_notes(user_notes: str | None, items: list[BookingItem], engineer_name: str | None, artist_name: str | None) -> str:
    clean_notes = (user_notes or "").strip()
    payload = json.dumps([{"service": item.service.value, "hours": item.hours} for item in items], ensure_ascii=True)
    meta_payload = json.dumps(
        {"engineer_name": (engineer_name or "").strip(), "artist_name": (artist_name or "").strip()},
        ensure_ascii=True,
    )
    parts = []
    if clean_notes:
        parts.append(clean_notes)
    parts.append(f"{PACKAGE_TAG}{payload}")
    parts.append(f"{META_TAG}{meta_payload}")
    return "\n\n".join(parts)


def _normalize_items(payload: BookingCreate) -> list[BookingItem]:
    if payload.items:
        return payload.items
    if payload.service is None:
        raise HTTPException(status_code=422, detail="service or items is required")
    return [BookingItem(service=payload.service, hours=payload.hours)]


def _calculate_studio_hours(items: list[BookingItem], explicit_studio_hours: int | None) -> int:
    total = 0
    for item in items:
        if item.service in (ServiceType.REC, ServiceType.NOLEGGIO):
            total += item.hours
        else:
            total += STUDIO_HOURS_BOOST.get(item.service, 0)
    if total > 0:
        return min(total, 8)
    return explicit_studio_hours or 1


def _calculate_total_price(items: list[BookingItem]) -> int:
    total = 0
    for item in items:
        cfg = get_service_config(item.service)
        total += estimate_price(item.service, item.hours if cfg.type == "hourly" else 1)
    return total


def to_booking_out(booking: Booking) -> BookingOut:
    meta = _extract_booking_meta(booking.notes) or {}
    return BookingOut(
        id=str(booking.id),
        service=booking.service,
        package_items=_extract_package_items(booking.notes),
        date=booking.date,
        start_time=booking.start_time,
        hours=booking.hours,
        price_total=booking.price_total,
        customer_name=booking.customer_name,
        engineer_name=meta.get("engineer_name"),
        artist_name=meta.get("artist_name"),
        email=booking.email,
        phone=booking.phone,
        notes=booking.notes,
        status=booking.status,
    )


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/pricing")
def pricing(db: Session = Depends(get_db)) -> dict:
    return get_merged_pricing(db)


@router.get("/availability", response_model=AvailabilityResponse)
def availability(
    date: date_type = Query(...),
    service: ServiceType | None = Query(default=None),
    services: str | None = Query(default=None, description="Comma-separated services for package"),
    hours: int = Query(default=1, ge=1, le=8),
    studio_hours: int | None = Query(default=None, ge=1, le=8),
    db: Session = Depends(get_db),
) -> AvailabilityResponse:
    requested_hours = 1
    if services:
        codes = [code.strip() for code in services.split(",") if code.strip()]
        if not codes:
            raise HTTPException(status_code=400, detail="Invalid services list")
        hourly_selected = any(PRICING_DATA["services"].get(code, {}).get("type") == "hourly" for code in codes)
        requested_hours = studio_hours or (hours if hourly_selected else 1)
    elif service is not None:
        cfg = PRICING_DATA["services"].get(service.value)
        if not cfg:
            raise HTTPException(status_code=400, detail="Unknown service")
        requested_hours = hours if cfg["type"] == "hourly" else (studio_hours or 1)
    elif studio_hours is not None:
        requested_hours = studio_hours

    slots = list_available_slots(db=db, booking_date=date, requested_hours=requested_hours)
    return AvailabilityResponse(date=date, slots=slots)


@router.post("/bookings", response_model=BookingPublicResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> BookingPublicResponse:
    items = _normalize_items(payload)
    studio_hours = _calculate_studio_hours(items, payload.studio_hours)

    if not in_working_hours(payload.date, payload.start_time, studio_hours):
        raise HTTPException(status_code=400, detail="Requested time is outside working hours")

    if not validate_slot_available(db, payload.date, payload.start_time, studio_hours):
        raise HTTPException(status_code=409, detail="Slot not available")

    lead_item = items[0]
    booking = Booking(
        service=lead_item.service,
        date=payload.date,
        start_time=payload.start_time,
        hours=studio_hours,
        price_total=_calculate_total_price(items),
        customer_name=payload.customer_name,
        email=(payload.email or PLACEHOLDER_EMAIL).strip() or PLACEHOLDER_EMAIL,
        phone=payload.phone,
        notes=_compose_notes(payload.notes, items, payload.engineer_name, payload.artist_name),
        status=BookingStatus.PENDING,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    body = (
        f"Nuova prenotazione {booking.id}\\n"
        f"Pacchetto: {', '.join([f'{item.service.value}({item.hours}h)' for item in items])}\\n"
        f"Data: {booking.date} {booking.start_time}\\n"
        f"Studio prenotato: {booking.hours}h\\n"
        f"Fonico: {(payload.engineer_name or '').strip() or '-'}\\n"
        f"Artista: {(payload.artist_name or '').strip() or payload.customer_name}\\n"
        f"Cliente: {booking.customer_name}\\n"
        f"Telefono: {booking.phone}\\n"
        f"Prezzo: {booking.price_total} EUR"
    )
    send_booking_emails("studio1998bari@gmail.com", None, "Nuova richiesta prenotazione", body)

    return BookingPublicResponse(id=str(booking.id), status=booking.status, price_total=booking.price_total)


@router.post("/admin/login", response_model=Token)
def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    admin = db.execute(select(AdminUser).where(AdminUser.email == form_data.username)).scalar_one_or_none()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=admin.email)
    return Token(access_token=token)


@router.get("/admin/bookings", response_model=AdminBookingsResponse)
def admin_bookings(
    from_date: date_type = Query(..., alias="from"),
    to_date: date_type = Query(..., alias="to"),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AdminBookingsResponse:
    items = (
        db.execute(
            select(Booking)
            .where(and_(Booking.date >= from_date, Booking.date <= to_date))
            .order_by(Booking.date.asc(), Booking.start_time.asc())
        )
        .scalars()
        .all()
    )
    return AdminBookingsResponse(items=[to_booking_out(item) for item in items])


@router.patch("/admin/bookings/{booking_id}", response_model=BookingOut)
def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> BookingOut:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    previous_status = booking.status
    booking.status = payload.status

    package_items = _extract_package_items(booking.notes)
    meta = _extract_booking_meta(booking.notes) or {}

    if payload.engineer_name is not None:
        user_notes = _extract_user_notes(booking.notes)
        items_for_notes = package_items or [BookingItem(service=booking.service, hours=booking.hours)]
        booking.notes = _compose_notes(user_notes, items_for_notes, payload.engineer_name, meta.get("artist_name", ""))
        meta = _extract_booking_meta(booking.notes) or {}

    if payload.status == BookingStatus.CONFIRMED:
        if not booking.google_event_id and google_calendar_enabled():
            try:
                booking.google_event_id = create_event_for_booking(
                    booking,
                    package_items,
                    engineer_name=meta.get("engineer_name"),
                    artist_name=meta.get("artist_name"),
                )
            except Exception as exc:
                logger.exception("Failed to create Google Calendar event")
                raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")

    if payload.status in (BookingStatus.CANCELED, BookingStatus.PENDING):
        should_remove_event = booking.google_event_id and previous_status == BookingStatus.CONFIRMED
        if should_remove_event and google_calendar_enabled():
            try:
                delete_event(booking.google_event_id)
            except Exception as exc:
                logger.exception("Failed to delete Google Calendar event")
                raise HTTPException(status_code=502, detail=f"Google Calendar error: {exc}")
            booking.google_event_id = None

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return to_booking_out(booking)


@router.get("/admin/pricing", response_model=AdminPricingResponse)
def admin_get_pricing(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> AdminPricingResponse:
    merged = get_merged_pricing(db)
    services_out = []
    for code, raw in PRICING_DATA["services"].items():
        merged_entry = merged["services"].get(code, raw)
        services_out.append(PricingServiceOut(
            code=code,
            label=merged_entry["label"],
            type=merged_entry["type"],
            price=merged_entry["price"],
            base_price=raw["price"],
            currency=merged_entry["currency"],
            description=merged_entry["description"],
            active=merged_entry.get("active", True),
        ))
    return AdminPricingResponse(services=services_out)


@router.patch("/admin/pricing/{service_code}", response_model=PricingServiceOut)
def admin_update_pricing(
    service_code: str,
    payload: PricingUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> PricingServiceOut:
    raw = PRICING_DATA["services"].get(service_code)
    if not raw:
        raise HTTPException(status_code=404, detail="Servizio non trovato")

    override = db.get(PricingOverride, service_code)
    if override is None:
        override = PricingOverride(service_code=service_code)
        db.add(override)

    if payload.price is not None:
        override.price = payload.price
    if payload.active is not None:
        override.active = payload.active

    db.commit()
    db.refresh(override)

    effective_price = override.price if override.price is not None else raw["price"]
    return PricingServiceOut(
        code=service_code,
        label=raw["label"],
        type=raw["type"],
        price=effective_price,
        base_price=raw["price"],
        currency=raw["currency"],
        description=raw["description"],
        active=override.active,
    )


@router.post("/admin/pricing/save-defaults", status_code=status.HTTP_200_OK)
def admin_save_pricing_defaults(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> dict:
    save_as_default(db)
    return {"ok": True}


@router.delete("/admin/pricing/{service_code}/reset", status_code=status.HTTP_204_NO_CONTENT)
def admin_reset_pricing(
    service_code: str,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    if service_code not in PRICING_DATA["services"]:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    override = db.get(PricingOverride, service_code)
    if override:
        db.delete(override)
        db.commit()


@router.post("/admin/calendar/sync")
def calendar_sync(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> dict:
    """Importa eventi futuri da Google Calendar nel DB come sessioni confermate."""
    result = sync_calendar_to_db(db)
    return result


@router.get("/admin/bookings/upcoming", response_model=UpcomingSessionsResponse)
def upcoming_sessions(
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> UpcomingSessionsResponse:
    from datetime import date as date_class
    today = date_class.today()
    items = (
        db.execute(
            select(Booking)
            .where(
                and_(
                    Booking.date >= today,
                    Booking.status == BookingStatus.CONFIRMED,
                )
            )
            .order_by(Booking.date.asc(), Booking.start_time.asc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return UpcomingSessionsResponse(items=[to_booking_out(b) for b in items])


# --- Custom services endpoints ---

@router.get("/admin/custom-services")
def list_custom_services(
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> dict:
    rows = db.query(CustomService).order_by(CustomService.sort_order, CustomService.code).all()
    return {"items": [
        {
            "code": r.code, "label": r.label, "service_type": r.service_type,
            "price": r.price, "currency": r.currency, "description": r.description,
            "active": r.active, "sort_order": r.sort_order,
        }
        for r in rows
    ]}


@router.post("/admin/custom-services", status_code=status.HTTP_201_CREATED)
def create_custom_service(
    payload: CustomServiceCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> dict:
    if payload.code in PRICING_DATA["services"]:
        raise HTTPException(status_code=409, detail="Il codice corrisponde a un servizio di default esistente")
    existing = db.get(CustomService, payload.code)
    if existing:
        raise HTTPException(status_code=409, detail="Codice servizio già in uso")
    row = CustomService(
        code=payload.code,
        label=payload.label,
        service_type=payload.service_type,
        price=payload.price,
        currency=payload.currency,
        description=payload.description,
        sort_order=payload.sort_order,
        active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"code": row.code, "label": row.label, "service_type": row.service_type,
            "price": row.price, "currency": row.currency, "description": row.description,
            "active": row.active, "sort_order": row.sort_order}


@router.patch("/admin/custom-services/{code}")
def update_custom_service(
    code: str,
    payload: PricingUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> dict:
    row = db.get(CustomService, code)
    if not row:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    if payload.price is not None:
        row.price = payload.price
    if payload.active is not None:
        row.active = payload.active
    db.commit()
    db.refresh(row)
    return {"code": row.code, "label": row.label, "service_type": row.service_type,
            "price": row.price, "currency": row.currency, "description": row.description,
            "active": row.active, "sort_order": row.sort_order}


@router.delete("/admin/custom-services/{code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_service(
    code: str,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    row = db.get(CustomService, code)
    if not row:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    db.delete(row)
    db.commit()


@router.delete("/admin/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
) -> None:
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
