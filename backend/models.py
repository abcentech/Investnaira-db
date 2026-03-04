"""
models.py — Pydantic request/response models
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str  # = first name

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v):
        return v.strip().lower()


class AdminLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v):
        return v.strip().lower()


class ClientSummary(BaseModel):
    email: str
    fn: str
    ln: str
    phone: Optional[str] = ""
    assets: float
    deposits: float
    returns: float
    withdrawals: float
    rank: int = 0
    tx_count: int = 0
    since: str = ""
    last: str = ""
    active: bool = True


class UploadResponse(BaseModel):
    success: bool
    message: str
    client_count: int = 0
    tx_count: int = 0
    filename: str = ""


class PlatformStats(BaseModel):
    client_count: int
    active_clients: int
    total_assets: float
    total_deposits: float
    total_returns: float
    total_withdrawals: float
    total_transactions: int
