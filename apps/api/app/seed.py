from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.admin_user import AdminUser


def run() -> None:
    db = SessionLocal()
    try:
        existing = db.execute(select(AdminUser).where(AdminUser.email == settings.ADMIN_EMAIL)).scalar_one_or_none()
        target_hash = get_password_hash(settings.ADMIN_PASSWORD)
        if existing is None:
            db.add(AdminUser(email=settings.ADMIN_EMAIL, password_hash=target_hash))
            db.commit()
            print(f"Seeded admin user: {settings.ADMIN_EMAIL}")
        else:
            from app.core.security import verify_password
            if not verify_password(settings.ADMIN_PASSWORD, existing.password_hash):
                existing.password_hash = target_hash
                db.add(existing)
                db.commit()
                print(f"Updated admin password for: {settings.ADMIN_EMAIL}")
            else:
                print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
