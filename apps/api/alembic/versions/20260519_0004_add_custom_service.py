"""add custom_service table

Revision ID: 20260519_0004
Revises: 20260519_0003
Create Date: 2026-05-19 14:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260519_0004"
down_revision = "20260519_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "custom_service",
        sa.Column("code", sa.String(length=32), nullable=False),
        sa.Column("label", sa.String(length=128), nullable=False),
        sa.Column("service_type", sa.String(length=16), nullable=False, server_default="fixed"),
        sa.Column("price", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=8), nullable=False, server_default="EUR"),
        sa.Column("description", sa.String(length=512), nullable=False, server_default=""),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("code"),
    )


def downgrade() -> None:
    op.drop_table("custom_service")
