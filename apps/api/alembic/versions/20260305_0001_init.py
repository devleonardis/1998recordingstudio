"""init

Revision ID: 20260305_0001
Revises: 
Create Date: 2026-03-05 19:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260305_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


service_type = postgresql.ENUM("prod", "rec", "noleggio", "mixmaster", name="service_type", create_type=False)
booking_status = postgresql.ENUM("PENDING", "CONFIRMED", "CANCELED", name="booking_status", create_type=False)


def upgrade() -> None:
    service_type.create(op.get_bind(), checkfirst=True)
    booking_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "admin_users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_admin_users_email"), "admin_users", ["email"], unique=True)

    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("service", service_type, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("hours", sa.Integer(), nullable=False),
        sa.Column("price_total", sa.Integer(), nullable=False),
        sa.Column("customer_name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=64), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", booking_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_bookings_date"), "bookings", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_bookings_date"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_admin_users_email"), table_name="admin_users")
    op.drop_table("admin_users")
    booking_status.drop(op.get_bind(), checkfirst=True)
    service_type.drop(op.get_bind(), checkfirst=True)
