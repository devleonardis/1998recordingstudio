from enum import StrEnum


class ServiceType(StrEnum):
    PROD = "prod"
    REC = "rec"
    NOLEGGIO = "noleggio"
    MIXMASTER = "mixmaster"


class BookingStatus(StrEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELED = "CANCELED"
