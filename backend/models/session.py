from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class SignInRequest(BaseModel):
    pat_name: str = Field(..., description="Tableau Personal Access Token name")
    pat_secret: str = Field(..., description="Tableau Personal Access Token secret")
    site_id: str = Field("", description="Site content URL — empty for Default")


class SignInResponse(BaseModel):
    token: str
    site_luid: str
    message: str = "Signed in successfully"


class SignOutResponse(BaseModel):
    message: str = "Signed out successfully"


class SessionStatusResponse(BaseModel):
    authenticated: bool
    site_luid: Optional[str] = None
    message: str
