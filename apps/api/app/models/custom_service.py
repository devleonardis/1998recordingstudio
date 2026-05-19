from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CustomService(Base):
    """Servizi aggiuntivi creati dall'admin, non presenti nel JSON di default."""
    __tablename__ = "custom_service"

    code: Mapped[str] = mapped_column(String(32), primary_key=True)   # es. "pack_promo"
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    service_type: Mapped[str] = mapped_column(String(16), nullable=False, default="fixed")  # "fixed" | "hourly"
    price: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="EUR")
    description: Mapped[str] = mapped_column(String(512), nullable=False, default="")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
