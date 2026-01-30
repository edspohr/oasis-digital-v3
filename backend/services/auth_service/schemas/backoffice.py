# services/auth_service/schemas/backoffice.py
"""
Pydantic schemas for backoffice (platform admin) operations.
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ============================================================================
# Organization with Stats (for listing)
# ============================================================================


class OrganizationWithStats(BaseModel):
    """Organization with member count for backoffice listing."""

    id: UUID
    name: str
    slug: str
    type: str
    settings: dict[str, Any] = Field(default_factory=dict)
    logo_url: str | None = None
    description: str | None = None
    created_at: datetime
    updated_at: datetime | None = None
    member_count: int = 0

    class Config:
        from_attributes = True


class PaginatedOrganizationsWithStats(BaseModel):
    """Paginated response for organizations with stats."""

    items: list[OrganizationWithStats]
    total: int
    skip: int
    limit: int


# ============================================================================
# Organization Create/Update for Admin
# ============================================================================


class OrganizationCreateAdmin(BaseModel):
    """Schema for admin creating an organization with owner assignment."""

    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(
        ...,
        min_length=2,
        max_length=50,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    type: str = Field(default="sponsor")
    description: str | None = None
    logo_url: str | None = None
    settings: dict[str, Any] = Field(default_factory=dict)
    owner_user_id: str = Field(..., description="UUID of the user to assign as owner")


class OrganizationUpdateAdmin(BaseModel):
    """Schema for admin updating an organization."""

    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = Field(
        None,
        min_length=2,
        max_length=50,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    type: str | None = None
    description: str | None = None
    logo_url: str | None = None
    settings: dict[str, Any] | None = None


# ============================================================================
# User List for Owner Selection
# ============================================================================


class UserBasicInfo(BaseModel):
    """Basic user info for selection lists."""

    id: UUID
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class PaginatedUsersResponse(BaseModel):
    """Paginated response for users."""

    items: list[UserBasicInfo]
    total: int
    skip: int
    limit: int
