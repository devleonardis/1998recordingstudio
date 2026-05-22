"""
Test per app/services/google_calendar.py

Casi coperti:
  1. Gli eventi all-day (solo "date", senza "dateTime") vengono ignorati.
  2. Gli eventi orari normali vengono inclusi come intervalli di blocco.
  3. Gli eventi cancellati vengono ignorati.
  4. Calendario vuoto → lista vuota.
"""
from datetime import date, datetime
from unittest.mock import MagicMock, patch

import pytest

from app.services.google_calendar import list_busy_intervals_for_date


def _make_timed_event(start_iso: str, end_iso: str, status: str = "confirmed") -> dict:
    return {
        "status": status,
        "start": {"dateTime": start_iso},
        "end": {"dateTime": end_iso},
    }


def _make_allday_event(start_date: str, end_date: str) -> dict:
    return {
        "status": "confirmed",
        "start": {"date": start_date},
        "end": {"date": end_date},
    }


@pytest.fixture()
def mock_gcal_service():
    """Restituisce un mock del servizio Google Calendar e abilita il modulo."""
    svc = MagicMock()
    with (
        patch("app.services.google_calendar.is_enabled", return_value=True),
        patch("app.services.google_calendar._calendar_service", return_value=svc),
    ):
        yield svc


def _setup_events(mock_svc, events: list[dict]) -> None:
    mock_svc.events.return_value.list.return_value.execute.return_value = {
        "items": events
    }


class TestListBusyIntervals:

    def test_allday_event_is_skipped(self, mock_gcal_service):
        """Un evento tutto il giorno NON deve bloccare nessuno slot."""
        _setup_events(mock_gcal_service, [
            _make_allday_event("2026-06-01", "2026-06-02"),
        ])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert result == [], "L'evento all-day non deve produrre alcun intervallo di blocco"

    def test_timed_event_is_included(self, mock_gcal_service):
        """Un evento orario deve produrre un intervallo di blocco corretto."""
        _setup_events(mock_gcal_service, [
            _make_timed_event("2026-06-01T14:00:00+02:00", "2026-06-01T18:00:00+02:00"),
        ])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert len(result) == 1
        start, end = result[0]
        assert start == datetime(2026, 6, 1, 14, 0)
        assert end == datetime(2026, 6, 1, 18, 0)

    def test_mixed_allday_and_timed(self, mock_gcal_service):
        """Evento all-day + evento orario → solo quello orario viene incluso."""
        _setup_events(mock_gcal_service, [
            _make_allday_event("2026-06-01", "2026-06-02"),
            _make_timed_event("2026-06-01T10:00:00+02:00", "2026-06-01T12:00:00+02:00"),
        ])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert len(result) == 1
        start, end = result[0]
        assert start == datetime(2026, 6, 1, 10, 0)
        assert end == datetime(2026, 6, 1, 12, 0)

    def test_cancelled_event_is_skipped(self, mock_gcal_service):
        """Gli eventi cancellati non devono bloccare slot."""
        _setup_events(mock_gcal_service, [
            _make_timed_event("2026-06-01T14:00:00+02:00", "2026-06-01T16:00:00+02:00", status="cancelled"),
        ])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert result == []

    def test_empty_calendar(self, mock_gcal_service):
        """Calendario vuoto → nessun intervallo di blocco."""
        _setup_events(mock_gcal_service, [])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert result == []

    def test_multiple_timed_events(self, mock_gcal_service):
        """Più eventi orari → tutti inclusi nell'ordine corretto."""
        _setup_events(mock_gcal_service, [
            _make_timed_event("2026-06-01T10:00:00+02:00", "2026-06-01T12:00:00+02:00"),
            _make_timed_event("2026-06-01T15:00:00+02:00", "2026-06-01T17:00:00+02:00"),
        ])

        result = list_busy_intervals_for_date(date(2026, 6, 1))

        assert len(result) == 2
        assert result[0][0] == datetime(2026, 6, 1, 10, 0)
        assert result[1][0] == datetime(2026, 6, 1, 15, 0)
