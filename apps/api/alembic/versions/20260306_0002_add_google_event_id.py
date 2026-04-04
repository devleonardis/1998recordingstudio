"""add google event id to bookings

Revision ID: 20260306_0002
Revises: 20260305_0001
Create Date: 2026-03-06 16:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260306_0002"
down_revision = "20260305_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("google_event_id", sa.String(length=255), nullable=True))
    op.create_index("ix_bookings_google_event_id", "bookings", ["google_event_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_bookings_google_event_id", table_name="bookings")
    op.drop_column("bookings", "google_event_id")
