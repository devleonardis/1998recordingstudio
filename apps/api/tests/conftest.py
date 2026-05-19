"""
Fixtures condivise tra tutti i test.

Ogni test riceve una sessione DB avvolta in una transazione che viene
rollbackata al termine: il DB di sviluppo resta pulito.
"""
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import Base


@pytest.fixture(scope="session")
def engine():
    return create_engine(settings.DATABASE_URL)


@pytest.fixture()
def db(engine):
    """
    Sessione DB isolata: ogni test gira dentro una transazione che viene
    sempre rollbackata, senza sporcare i dati reali.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


# ---------------------------------------------------------------------------
# Helpers per costruire payload evento Google Calendar (formato API)
# ---------------------------------------------------------------------------

def make_gcal_event(
    event_id: str,
    summary: str = "Sessione Studio",
    start: str = "2026-06-10T10:00:00+02:00",
    end: str = "2026-06-10T13:00:00+02:00",
    description: str = "",
    status: str = "confirmed",
) -> dict:
    return {
        "id": event_id,
        "summary": summary,
        "status": status,
        "start": {"dateTime": start},
        "end": {"dateTime": end},
        "description": description,
    }


def app_event_description(
    artist: str = "Mario Rossi",
    customer: str = "Mario Rossi",
    phone: str = "+39 333 1234567",
    engineer: str = "NARDI",
    package: str = "rec(3h)",
    hours: int = 3,
    price: int = 150,
) -> str:
    return (
        f"Prenotazione studio\n"
        f"Fonico: {engineer}\n"
        f"Artista: {artist}\n"
        f"Cliente: {customer}\n"
        f"Telefono: {phone}\n"
        f"Pacchetto: {package}\n"
        f"Ore studio: {hours}\n"
        f"Prezzo: {price} EUR"
    )
