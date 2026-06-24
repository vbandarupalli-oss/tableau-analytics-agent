from __future__ import annotations

from fastapi import APIRouter, HTTPException

from auth import get_session
from models.session import SessionStatusResponse, SignInResponse, SignOutResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signin", response_model=SignInResponse)
async def sign_in() -> SignInResponse:
    """Trigger a Tableau sign-in using credentials from .env."""
    session = get_session()
    try:
        await session.ensure_valid()
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Tableau sign-in failed: {exc}") from exc

    return SignInResponse(
        token=session.token or "",
        site_luid=session.site_luid or "",
    )


@router.post("/signout", response_model=SignOutResponse)
async def sign_out() -> SignOutResponse:
    session = get_session()
    await session.sign_out()
    return SignOutResponse()


@router.get("/status", response_model=SessionStatusResponse)
async def session_status() -> SessionStatusResponse:
    session = get_session()
    authenticated = bool(session.token and not session._is_expired())
    return SessionStatusResponse(
        authenticated=authenticated,
        site_luid=session.site_luid if authenticated else None,
        message="Authenticated" if authenticated else "Not authenticated",
    )
