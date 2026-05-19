from datetime import date, datetime, time, timedelta
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.services.google_calendar import is_enabled as google_calendar_enabled, list_busy_intervals_for_date


def _to_datetime(base_date: date, value: time) -> datetime:
    return datetime.combine(base_date, value)


def _parse_time(value: str) -> time:
    hour, minute = value.split(":")
    return time(hour=int(hour), minute=int(minute))


def _overlaps(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime) -> bool:
    return start_a < end_b and start_b < end_a


def in_working_hours(booking_date: date, start_time: time, hours: int) -> bool:
    start_cfg = _parse_time(settings.WORKING_HOURS_START)
    end_cfg = _parse_time(settings.WORKING_HOURS_END)
    day_start = _to_datetime(booking_date, start_cfg)
    day_end = _to_datetime(booking_date, end_cfg)
    requested_start = _to_datetime(booking_date, start_time)
    requested_end = requested_start + timedelta(hours=hours)
    return requested_start >= day_start and requested_end <= day_end


def list_available_slots(db: Session, booking_date: date, requested_hours: int) -> list[str]:
    start_cfg = _parse_time(settings.WORKING_HOURS_START)
    end_cfg = _parse_time(settings.WORKING_HOURS_END)

    day_start = _to_datetime(booking_date, start_cfg)
    day_end = _to_datetime(booking_date, end_cfg)

    if requested_hours < 1:
        requested_hours = 1

    query = (
        select(Booking)
        .where(
            and_(
                Booking.date == booking_date,
                Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
            )
        )
        .order_by(Booking.start_time.asc())
    )
    existing = db.execute(query).scalars().all()
    external_busy = list_busy_intervals_for_date(booking_date)

    slots: list[str] = []
    cursor = day_start
    while cursor + timedelta(hours=requested_hours) <= day_end:
        slot_end = cursor + timedelta(hours=requested_hours)
        conflict = False
        for booking in existing:
            booked_start = _to_datetime(booking.date, booking.start_time)
            booked_end = booked_start + timedelta(hours=booking.hours)
            if _overlaps(cursor, slot_end, booked_start, booked_end):
                conflict = True
                break
        if not conflict:
            for busy_start, busy_end in external_busy:
                if _overlaps(cursor, slot_end, busy_start, busy_end):
                    conflict = True
                    break
        if not conflict:
            slots.append(cursor.strftime("%H:%M"))
        cursor += timedelta(hours=1)

    return slots


def validate_slot_available(
    db: Session,
    booking_date: date,
    start_time: time,
    hours: int,
    exclude_booking_id: str | None = None,
) -> bool:
    start_dt = _to_datetime(booking_date, start_time)
    end_dt = start_dt + timedelta(hours=hours)

    query = select(Booking).where(
        and_(
            Booking.date == booking_date,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        )
    )
    existing = db.execute(query).scalars().all()
    external_busy = list_busy_intervals_for_date(booking_date)

    for booking in existing:
        if exclude_booking_id and str(booking.id) == exclude_booking_id:
            continue
        booked_start = _to_datetime(booking.date, booking.start_time)
        booked_end = booked_start + timedelta(hours=booking.hours)
        if _overlaps(start_dt, end_dt, booked_start, booked_end):
            return False

    for busy_start, busy_end in external_busy:
        if _overlaps(start_dt, end_dt, busy_start, busy_end):
            return False

    return True
