from __future__ import annotations

from datetime import date, datetime, time, timedelta
import json
import logging
from functools import lru_cache
from zoneinfo import ZoneInfo

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings
from app.models.booking import Booking
from app.schemas.booking import BookingItem

logger = logging.getLogger(__name__)
SCOPES = ["https://www.googleapis.com/auth/calendar"]


@lru_cache
def _calendar_service():
    if not settings.GOOGLE_CALENDAR_ENABLED:
        return None
    if not settings.GOOGLE_CALENDAR_ID:
        return None

    creds = None
    if settings.GOOGLE_SERVICE_ACCOUNT_JSON:
        info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    elif settings.GOOGLE_SERVICE_ACCOUNT_FILE:
        creds = service_account.Credentials.from_service_account_file(settings.GOOGLE_SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    if creds is None:
        logger.warning("Google Calendar enabled but credentials are missing")
        return None

    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def is_enabled() -> bool:
    return bool(settings.GOOGLE_CALENDAR_ENABLED and settings.GOOGLE_CALENDAR_ID and _calendar_service() is not None)


def _tz() -> ZoneInfo:
    return ZoneInfo(settings.GOOGLE_CALENDAR_TIMEZONE)


def _start_end_for_day(target_date: date) -> tuple[datetime, datetime]:
    start = datetime.combine(target_date, time.min, tzinfo=_tz())
    end = start + timedelta(days=1)
    return start, end


def _parse_event_datetime(value: dict) -> datetime | None:
    date_time = value.get("dateTime")
    if date_time:
        return datetime.fromisoformat(date_time.replace("Z", "+00:00"))

    date_only = value.get("date")
    if date_only:
        base = datetime.fromisoformat(date_only)
        return base.replace(tzinfo=_tz())

    return None


def list_busy_intervals_for_date(target_date: date) -> list[tuple[datetime, datetime]]:
    if not is_enabled():
        return []

    service = _calendar_service()
    day_start, day_end = _start_end_for_day(target_date)

    try:
        events_result = (
            service.events()
            .list(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                timeMin=day_start.isoformat(),
                timeMax=day_end.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
    except HttpError as exc:
        logger.warning("Failed to fetch Google Calendar events: %s", exc)
        return []

    intervals: list[tuple[datetime, datetime]] = []
    local_tz = _tz()
    for event in events_result.get("items", []):
        if event.get("status") == "cancelled":
            continue

        start = _parse_event_datetime(event.get("start", {}))
        end = _parse_event_datetime(event.get("end", {}))
        if start and end and start < end:
            # Normalize to local timezone and strip tzinfo so it matches DB-side naive datetimes.
            intervals.append(
                (
                    start.astimezone(local_tz).replace(tzinfo=None),
                    end.astimezone(local_tz).replace(tzinfo=None),
                )
            )

    return intervals


def list_events_in_range(from_date: date, to_date: date) -> list[dict]:
    """Restituisce tutti gli eventi del calendario in un intervallo di date."""
    if not is_enabled():
        return []

    service = _calendar_service()
    tz = _tz()
    time_min = datetime.combine(from_date, __import__("datetime").time.min, tzinfo=tz).isoformat()
    time_max = datetime.combine(to_date + timedelta(days=1), __import__("datetime").time.min, tzinfo=tz).isoformat()

    results: list[dict] = []
    page_token = None
    while True:
        try:
            kwargs: dict = dict(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy="startTime",
                maxResults=250,
            )
            if page_token:
                kwargs["pageToken"] = page_token
            resp = service.events().list(**kwargs).execute()
        except HttpError as exc:
            logger.warning("Failed to fetch calendar events range: %s", exc)
            break
        results.extend(resp.get("items", []))
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return results


def create_event_for_booking(
    booking: Booking,
    items: list[BookingItem] | None,
    engineer_name: str | None = None,
    artist_name: str | None = None,
) -> str | None:
    if not is_enabled():
        return None

    service = _calendar_service()
    tz = _tz()
    start_dt = datetime.combine(booking.date, booking.start_time, tzinfo=tz)
    end_dt = start_dt + timedelta(hours=booking.hours)

    package = ", ".join([f"{item.service.value}({item.hours}h)" for item in (items or [])]) or booking.service.value
    service_label = " + ".join([item.service.value.upper() for item in (items or [])]) or booking.service.value.upper()
    normalized_engineer = (engineer_name or "NARDI").strip().upper()
    normalized_artist = (artist_name or booking.customer_name).strip()
    description = (
        f"Prenotazione studio\\n"
        f"Fonico: {normalized_engineer}\\n"
        f"Artista: {normalized_artist}\\n"
        f"Cliente: {booking.customer_name}\\n"
        f"Telefono: {booking.phone}\\n"
        f"Pacchetto: {package}\\n"
        f"Ore studio: {booking.hours}\\n"
        f"Prezzo: {booking.price_total} EUR"
    )

    event = {
        "summary": f"{normalized_engineer} - {normalized_artist} {service_label}",
        "description": description,
        "start": {"dateTime": start_dt.isoformat(), "timeZone": settings.GOOGLE_CALENDAR_TIMEZONE},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": settings.GOOGLE_CALENDAR_TIMEZONE},
    }

    created = service.events().insert(calendarId=settings.GOOGLE_CALENDAR_ID, body=event).execute()
    return created.get("id")


def delete_event(event_id: str) -> None:
    if not is_enabled() or not event_id:
        return

    service = _calendar_service()
    try:
        service.events().delete(calendarId=settings.GOOGLE_CALENDAR_ID, eventId=event_id).execute()
    except HttpError as exc:
        # 410/404 means already removed; ignore.
        status = getattr(getattr(exc, "resp", None), "status", None)
        if status in (404, 410):
            return
        raise
