from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PricingOverride(Base):
    __tablename__ = "pricing_override"

    service_code: Mapped[str] = mapped_column(String(32), primary_key=True)
    price: Mapped[int | None] = mapped_column(Integer, nullable=True)   # None → usa default JSON
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
