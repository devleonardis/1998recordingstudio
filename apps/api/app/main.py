from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.routes import router
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.db.session import SessionLocal
from app.models.admin_user import AdminUser

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.on_event("startup")
def ensure_admin_user() -> None:
    db = SessionLocal()
    try:
        existing = db.execute(select(AdminUser).where(AdminUser.email == settings.ADMIN_EMAIL)).scalar_one_or_none()
        target_hash = get_password_hash(settings.ADMIN_PASSWORD)
        if existing is None:
            admin = AdminUser(email=settings.ADMIN_EMAIL, password_hash=target_hash)
            db.add(admin)
            db.commit()
        elif not verify_password(settings.ADMIN_PASSWORD, existing.password_hash):
            existing.password_hash = target_hash
            db.add(existing)
            db.commit()
    finally:
        db.close()
