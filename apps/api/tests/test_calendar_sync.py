"""
Test per app/services/calendar_sync.py

Casi coperti:
  1. Deduplicazione: prenotazione già in DB non viene reimportata.
  2. Parsing titolo formato "FONICO - ARTISTA SERVICE_KW".
  3. Rilevamento eventi di blocco ("nardi non disponibile").
  4. Calcolo corretto di servizio e prezzo.
  5. Funzioni helper (_extract_field, _parse_price, _parse_title,
     _is_block_event, _detect_service_and_price).
"""
from datetime import date, time

import pytest

from app.models.booking import Booking
from app.models.enums import BookingStatus, ServiceType
from app.services.calendar_sync import (
    sync_calendar_to_db,
    _extract_field,
    _parse_price,
    _parse_title,
    _is_block_event,
    _detect_service_and_price,
)

from tests.conftest import make_gcal_event, app_event_description


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _insert_confirmed_booking(db, google_event_id: str, **kwargs) -> Booking:
    """Inserisce un booking CONFIRMED già collegato a un evento Google Calendar."""
    defaults = dict(
        service=ServiceType.REC,
        date=date(2026, 6, 10),
        start_time=time(10, 0),
        hours=3,
        price_total=150,
        customer_name="Mario Rossi",
        email="noreply@1998studio.local",
        phone="+39 333 1234567",
        notes="",
        status=BookingStatus.CONFIRMED,
        google_event_id=google_event_id,
    )
    defaults.update(kwargs)
    booking = Booking(**defaults)
    db.add(booking)
    db.flush()
    return booking


# ---------------------------------------------------------------------------
# Test: deduplicazione — il caso chiave
# ---------------------------------------------------------------------------

class TestDeduplication:

    def test_app_booking_not_reimported(self, db, mocker):
        """
        CASO CRITICO: prenotazione creata dall'app → evento sul calendario.
        Il sync NON deve creare un secondo record nel DB.
        """
        event_id = "gcal_evt_app_001"
        _insert_confirmed_booking(db, event_id)

        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    event_id=event_id,
                    summary="NARDI - Mario Rossi REC",
                    description=app_event_description(),
                )
            ],
        )

        result = sync_calendar_to_db(db)

        assert result["imported"] == 0, "Non deve importare un evento già in DB"
        assert result["skipped"] == 1

        from sqlalchemy import select
        rows = db.execute(
            select(Booking).where(Booking.google_event_id == event_id)
        ).scalars().all()
        assert len(rows) == 1, "Deve esistere esattamente un booking con questo event_id"

    def test_multiple_existing_bookings_all_skipped(self, db, mocker):
        """Tre eventi, tutti già in DB → nessuno importato."""
        ids = ["evt_001", "evt_002", "evt_003"]
        for i, eid in enumerate(ids):
            _insert_confirmed_booking(
                db, eid,
                date=date(2026, 6, 10 + i),
                start_time=time(10 + i, 0),
            )

        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    event_id=eid,
                    start=f"2026-06-{10+i:02d}T10:00:00+02:00",
                    end=f"2026-06-{10+i:02d}T13:00:00+02:00",
                )
                for i, eid in enumerate(ids)
            ],
        )

        result = sync_calendar_to_db(db)

        assert result["imported"] == 0
        assert result["skipped"] == 3

    def test_new_event_is_imported(self, db, mocker):
        """Evento nuovo (non in DB) → deve essere importato."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(event_id="gcal_new_001", summary="NARDI - LUCA REC")
            ],
        )

        result = sync_calendar_to_db(db)

        assert result["imported"] == 1
        assert result["errors"] == 0

    def test_mixed_new_and_existing(self, db, mocker):
        """2 eventi: uno già in DB, uno nuovo. Solo il nuovo viene importato."""
        existing_id = "gcal_existing"
        new_id = "gcal_brand_new"
        _insert_confirmed_booking(db, existing_id)

        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(event_id=existing_id, summary="NARDI - MARIO REC"),
                make_gcal_event(event_id=new_id, summary="SVG - LUCA SESSION COMPLETA"),
            ],
        )

        result = sync_calendar_to_db(db)

        assert result["imported"] == 1
        assert result["skipped"] == 1


# ---------------------------------------------------------------------------
# Test: parsing degli eventi
# ---------------------------------------------------------------------------

class TestEventParsing:

    def test_app_created_event_fields_extracted(self, db, mocker):
        """
        Evento creato dall'app con description strutturata:
        artista, cliente, telefono e prezzo devono essere letti correttamente.
        """
        desc = app_event_description(
            artist="Luca Bianchi",
            customer="Marco Neri",
            phone="+39 333 9876543",
            engineer="SVG",
            price=200,
        )
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[make_gcal_event("evt_parsed", description=desc)],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 1

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_parsed")
        ).scalar_one()

        assert booking.customer_name == "Marco Neri"
        assert booking.phone == "+39 333 9876543"
        assert booking.price_total == 200
        assert booking.status == BookingStatus.CONFIRMED

    def test_title_format_rec_hourly_price(self, db, mocker):
        """
        Titolo 'NARDI - MONDÈ REC' con 2 ore → prezzo 100 € (50€/h × 2).
        """
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    "evt_rec_hourly",
                    summary="NARDI - MONDÈ REC",
                    start="2026-07-01T10:00:00+02:00",
                    end="2026-07-01T12:00:00+02:00",  # 2 ore
                    description="",
                )
            ],
        )

        sync_calendar_to_db(db)

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_rec_hourly")
        ).scalar_one()

        assert booking.service == ServiceType.REC
        assert booking.hours == 2
        assert booking.price_total == 100  # 50 €/h × 2h
        assert "MONDÈ" in booking.customer_name

    def test_title_format_session_completa(self, db, mocker):
        """
        Titolo 'SVG - GIORGIO SESSION COMPLETA' → prezzo fisso 350 €.
        """
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    "evt_session_completa",
                    summary="SVG - GIORGIO SESSION COMPLETA",
                    start="2026-07-02T10:00:00+02:00",
                    end="2026-07-02T16:00:00+02:00",  # 6 ore
                    description="",
                )
            ],
        )

        sync_calendar_to_db(db)

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_session_completa")
        ).scalar_one()

        assert booking.service == ServiceType.REC
        assert booking.price_total == 350
        assert "GIORGIO" in booking.customer_name

    def test_title_format_rmm(self, db, mocker):
        """
        Titolo 'NARDI - N. TURSI RMM' → ServiceType.MIXMASTER, prezzo 150 €.
        """
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    "evt_rmm",
                    summary="NARDI - N. TURSI RMM",
                    start="2026-07-03T14:00:00+02:00",
                    end="2026-07-03T17:00:00+02:00",
                    description="",
                )
            ],
        )

        sync_calendar_to_db(db)

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_rmm")
        ).scalar_one()

        assert booking.service == ServiceType.MIXMASTER
        assert booking.price_total == 150
        assert "TURSI" in booking.customer_name

    def test_event_hours_calculated_correctly(self, db, mocker):
        """La durata viene calcolata dalla differenza start/end."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    "evt_hours",
                    summary="NARDI - LUCA REC",
                    start="2026-07-01T14:00:00+02:00",
                    end="2026-07-01T18:00:00+02:00",  # 4 ore
                )
            ],
        )

        sync_calendar_to_db(db)

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_hours")
        ).scalar_one()

        assert booking.hours == 4
        assert booking.start_time == time(14, 0)

    def test_event_date_correct(self, db, mocker):
        """La data viene estratta correttamente dall'evento."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event(
                    "evt_date",
                    summary="SVG - MARCO REC",
                    start="2026-08-15T11:00:00+02:00",
                    end="2026-08-15T13:00:00+02:00",
                )
            ],
        )

        sync_calendar_to_db(db)

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_date")
        ).scalar_one()

        assert booking.date == date(2026, 8, 15)


# ---------------------------------------------------------------------------
# Test: eventi da scartare
# ---------------------------------------------------------------------------

class TestSkippedEvents:

    def test_cancelled_event_skipped(self, db, mocker):
        """Gli eventi con status='cancelled' non vengono importati."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event("evt_cancelled", status="cancelled")
            ],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 0

    def test_event_without_id_skipped(self, db, mocker):
        """Evento senza id viene scartato silenziosamente."""
        event = make_gcal_event("placeholder")
        event["id"] = ""

        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[event],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 0

    def test_event_with_invalid_dates_skipped(self, db, mocker):
        """Evento con start >= end viene scartato."""
        event = make_gcal_event(
            "evt_bad_dates",
            start="2026-06-10T14:00:00+02:00",
            end="2026-06-10T10:00:00+02:00",  # end prima di start
        )
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[event],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 0

    def test_empty_calendar_returns_zero(self, db, mocker):
        """Calendario vuoto → nessun import, nessun errore."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[],
        )

        result = sync_calendar_to_db(db)
        assert result == {"imported": 0, "skipped": 0, "errors": 0}

    def test_block_event_not_imported(self, db, mocker):
        """'nardi non disponibile' è un blocco, NON deve essere importato come booking."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event("evt_block", summary="nardi non disponibile")
            ],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 0

        # Non deve creare nessun booking nel DB
        from sqlalchemy import select
        rows = db.execute(
            select(Booking).where(Booking.google_event_id == "evt_block")
        ).scalars().all()
        assert len(rows) == 0

    def test_multiple_block_events_all_skipped(self, db, mocker):
        """Più eventi di blocco → tutti scartati, nessun import."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event("blk_1", summary="SVG non disponibile"),
                make_gcal_event("blk_2", summary="NARDI - pausa"),
                make_gcal_event("blk_3", summary="studio chiuso"),
            ],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 0

    def test_block_and_real_event_mixed(self, db, mocker):
        """Un blocco + una sessione reale → solo la sessione viene importata."""
        mocker.patch(
            "app.services.calendar_sync.list_events_in_range",
            return_value=[
                make_gcal_event("blk_nardi", summary="nardi non disponibile"),
                make_gcal_event(
                    "sess_real",
                    summary="SVG - WHYTE SESSION COMPLETA",
                    start="2026-07-10T10:00:00+02:00",
                    end="2026-07-10T16:00:00+02:00",
                    description="",
                ),
            ],
        )

        result = sync_calendar_to_db(db)
        assert result["imported"] == 1

        from sqlalchemy import select
        booking = db.execute(
            select(Booking).where(Booking.google_event_id == "sess_real")
        ).scalar_one()
        assert booking.price_total == 350


# ---------------------------------------------------------------------------
# Test unitari sulle funzioni helper
# ---------------------------------------------------------------------------

class TestHelpers:

    # ── _extract_field ──────────────────────────────────────────────────────

    def test_extract_field_found(self):
        desc = "Fonico: NARDI\nArtista: Mario\nPrezzo: 150 EUR"
        assert _extract_field(desc, "Fonico") == "NARDI"
        assert _extract_field(desc, "Artista") == "Mario"
        assert _extract_field(desc, "Prezzo") == "150 EUR"

    def test_extract_field_missing(self):
        assert _extract_field("niente qui", "Fonico") == ""
        assert _extract_field("", "Artista", "default") == "default"

    # ── _parse_price ────────────────────────────────────────────────────────

    @pytest.mark.parametrize("raw,expected", [
        ("150 EUR", 150),
        ("200", 200),
        ("0 EUR", 0),
        ("", 0),
        ("abc", 0),
    ])
    def test_parse_price(self, raw, expected):
        assert _parse_price(raw) == expected

    # ── _is_block_event ─────────────────────────────────────────────────────

    @pytest.mark.parametrize("summary,expected", [
        ("nardi non disponibile", True),
        ("SVG non disponibile martedì", True),
        ("pausa pranzo", True),
        ("blocco studio", True),
        ("studio chiuso", True),
        ("NARDI assente", True),
        ("SVG - GIORGIO SESSION COMPLETA", False),
        ("NARDI - MONDÈ REC", False),
        ("NARDI - N. TURSI RMM", False),
        ("SVG - WHYTE SESSION COMPLETA", False),
    ])
    def test_is_block_event(self, summary, expected):
        assert _is_block_event(summary) == expected

    # ── _parse_title ────────────────────────────────────────────────────────

    @pytest.mark.parametrize("summary,exp_engineer,exp_artist,exp_kw", [
        ("NARDI - MONDÈ REC",           "NARDI",  "MONDÈ",    "REC"),
        ("SVG - GIORGIO SESSION COMPLETA", "SVG", "GIORGIO",  "SESSION COMPLETA"),
        ("NARDI - N. TURSI RMM",        "NARDI",  "N. TURSI", "RMM"),
        ("SVG - WHYTE SESSION COMPLETA","SVG",    "WHYTE",    "SESSION COMPLETA"),
        ("NARDI - LUCA MIX & MASTER",   "NARDI",  "LUCA",     "MIX & MASTER"),
        ("NARDI - LUCA PROD",           "NARDI",  "LUCA",     "PROD"),
        # Nessun ' - ': nessun fonico estratto
        ("Recording Session",           "",        "",         "REC"),
        ("Sessione generica",           "",        "Sessione generica", ""),
    ])
    def test_parse_title(self, summary, exp_engineer, exp_artist, exp_kw):
        engineer, artist, kw = _parse_title(summary)
        assert engineer == exp_engineer
        assert kw == exp_kw
        if exp_artist:
            assert artist == exp_artist

    # ── _detect_service_and_price ───────────────────────────────────────────

    @pytest.mark.parametrize("kw,hours,exp_service,exp_price", [
        ("SESSION COMPLETA", 6, ServiceType.REC,       350),
        ("SESSION COMPLETA", 3, ServiceType.REC,       350),  # fisso indipendente dalle ore
        ("RMM",              1, ServiceType.MIXMASTER,  150),
        ("REC",              2, ServiceType.REC,        100),  # 50 €/h × 2
        ("REC",              3, ServiceType.REC,        150),  # 50 €/h × 3
        ("RECORDING",        4, ServiceType.REC,        200),  # 50 €/h × 4
        ("MIX & MASTER",     1, ServiceType.MIXMASTER,  100),
        ("MASTER",           1, ServiceType.MIXMASTER,  100),
        ("MIX",              1, ServiceType.MIXMASTER,  100),
        ("PROD",             1, ServiceType.PROD,       200),
        ("NOLEGGIO",         1, ServiceType.NOLEGGIO,   0),
        ("",                 1, ServiceType.NOLEGGIO,   0),   # nessuna kw → fallback
    ])
    def test_detect_service_and_price(self, kw, hours, exp_service, exp_price):
        service, price = _detect_service_and_price(kw, hours)
        assert service == exp_service
        assert price == exp_price
