from datetime import date, time
from pydantic import BaseModel, Field, field_validator

from app.models.enums import BookingStatus, ServiceType


class BookingItem(BaseModel):
    service: ServiceType
    hours: int = Field(default=1, ge=1, le=8)


class BookingCreate(BaseModel):
    service: ServiceType | None = None
    items: list[BookingItem] | None = None
    date: date
    start_time: time
    hours: int = Field(default=1, ge=1, le=8)
    studio_hours: int | None = Field(default=None, ge=1, le=8)
    customer_name: str = Field(min_length=2, max_length=160)
    engineer_name: str | None = Field(default=None, max_length=64)
    artist_name: str | None = Field(default=None, max_length=160)
    email: str | None = Field(default=None, max_length=255)
    phone: str = Field(min_length=5, max_length=64)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: list[BookingItem] | None) -> list[BookingItem] | None:
        if v is not None and len(v) == 0:
            raise ValueError("items cannot be empty")
        return v


class BookingOut(BaseModel):
    id: str
    service: ServiceType
    package_items: list[BookingItem] | None = None
    date: date
    start_time: time
    hours: int
    price_total: int
    customer_name: str
    engineer_name: str | None = None
    artist_name: str | None = None
    email: str | None = None
    phone: str
    notes: str | None
    status: BookingStatus


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    engineer_name: str | None = Field(default=None, max_length=64)


class AvailabilityResponse(BaseModel):
    date: date
    slots: list[str]


class BookingPublicResponse(BaseModel):
    id: str
    status: BookingStatus
    price_total: int


class AdminBookingsResponse(BaseModel):
    items: list[BookingOut]


class AvailabilityQuery(BaseModel):
    date: date
    service: ServiceType
    hours: int = Field(default=1, ge=1, le=8)

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: int) -> int:
        if v < 1 or v > 8:
            raise ValueError("hours must be between 1 and 8")
        return v


# --- Pricing admin schemas ---

class PricingServiceOut(BaseModel):
    code: str
    label: str
    type: str
    price: int
    base_price: int
    currency: str
    description: str
    active: bool


class AdminPricingResponse(BaseModel):
    services: list[PricingServiceOut]


class PricingUpdate(BaseModel):
    price: int | None = Field(default=None, ge=0, le=100_000)
    active: bool | None = None


class CustomServiceCreate(BaseModel):
    code: str = Field(min_length=2, max_length=32, pattern=r"^[a-z0-9_]+$")
    label: str = Field(min_length=2, max_length=128)
    service_type: str = Field(default="fixed", pattern=r"^(fixed|hourly)$")
    price: int = Field(ge=0, le=100_000)
    currency: str = Field(default="EUR", max_length=8)
    description: str = Field(default="", max_length=512)
    sort_order: int = Field(default=100, ge=0)


class UpcomingSessionsResponse(BaseModel):
    items: list[BookingOut]
