"""add pricing_override table

Revision ID: 20260519_0003
Revises: 20260306_0002
Create Date: 2026-05-19 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260519_0003"
down_revision = "20260306_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "pricing_override",
        sa.Column("service_code", sa.String(length=32), nullable=False),
        sa.Column("price", sa.Integer(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("service_code"),
    )


def downgrade() -> None:
    op.drop_table("pricing_override")
