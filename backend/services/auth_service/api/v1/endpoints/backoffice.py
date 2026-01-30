# services/auth_service/api/v1/endpoints/backoffice.py
"""
Backoffice endpoints for Platform Admins.

These endpoints provide global management capabilities:
- List/Create/Update/Delete organizations
- List users for owner assignment
- Global statistics and metrics
"""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from common.auth.security import PlatformAdminRequired
from common.database.client import get_admin_client

from services.auth_service.schemas.backoffice import (
    OrganizationCreateAdmin,
    OrganizationUpdateAdmin,
    OrganizationWithStats,
    PaginatedOrganizationsWithStats,
    PaginatedUsersResponse,
    UserBasicInfo,
)

router = APIRouter()


# ============================================================================
# Organizations CRUD
# ============================================================================


@router.get("/organizations", response_model=PaginatedOrganizationsWithStats)
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by name"),
    org_type: str | None = Query(None, description="Filter by type"),
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """List all organizations with member counts (Platform Admin only)."""
    try:
        # Build base query
        query = db.table("organizations").select(
            "id, name, slug, type, settings, logo_url, description, created_at, updated_at",
            count="exact",
        )

        # Apply filters
        if search:
            query = query.ilike("name", f"%{search}%")
        if org_type:
            query = query.eq("type", org_type)

        # Apply pagination
        query = query.order("created_at", desc=True).range(skip, skip + limit - 1)

        result = await query.execute()

        # Get member counts for each organization
        org_ids = [org["id"] for org in result.data]
        member_counts = {}

        if org_ids:
            # Fetch member counts in batch
            for org_id in org_ids:
                count_result = (
                    await db.table("organization_members")
                    .select("id", count="exact", head=True)
                    .eq("organization_id", org_id)
                    .eq("status", "active")
                    .execute()
                )
                member_counts[org_id] = count_result.count or 0

        # Attach member counts
        items = []
        for org in result.data:
            org["member_count"] = member_counts.get(org["id"], 0)
            items.append(OrganizationWithStats(**org))

        return PaginatedOrganizationsWithStats(
            items=items,
            total=result.count or 0,
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logging.error(f"Error listing organizations: {e}")
        raise HTTPException(status_code=500, detail="Error listing organizations") from e


@router.post(
    "/organizations",
    response_model=OrganizationWithStats,
    status_code=status.HTTP_201_CREATED,
)
async def create_organization(
    org_in: OrganizationCreateAdmin,
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """Create a new organization and assign owner (Platform Admin only)."""
    try:
        # Verify owner user exists
        owner_check = (
            await db.table("profiles")
            .select("id")
            .eq("id", org_in.owner_user_id)
            .single()
            .execute()
        )

        if not owner_check.data:
            raise HTTPException(status_code=404, detail="Owner user not found")

        # Create organization
        org_data = {
            "name": org_in.name,
            "slug": org_in.slug,
            "type": org_in.type,
            "description": org_in.description,
            "logo_url": org_in.logo_url,
            "settings": org_in.settings,
        }

        org_result = await db.table("organizations").insert(org_data).execute()

        if not org_result.data:
            raise HTTPException(status_code=400, detail="Error creating organization")

        new_org = org_result.data[0]

        # Assign owner
        member_data = {
            "organization_id": new_org["id"],
            "user_id": org_in.owner_user_id,
            "role": "owner",
            "status": "active",
        }

        await db.table("organization_members").insert(member_data).execute()

        # Return with member count
        new_org["member_count"] = 1
        return OrganizationWithStats(**new_org)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating organization: {e}")
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=400, detail="Organization with this slug already exists"
            ) from e
        raise HTTPException(status_code=500, detail="Error creating organization") from e


@router.get("/organizations/{org_id}", response_model=OrganizationWithStats)
async def get_organization(
    org_id: UUID,
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """Get organization details (Platform Admin only)."""
    try:
        result = (
            await db.table("organizations")
            .select("*")
            .eq("id", str(org_id))
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Get member count
        count_result = (
            await db.table("organization_members")
            .select("id", count="exact", head=True)
            .eq("organization_id", str(org_id))
            .eq("status", "active")
            .execute()
        )

        result.data["member_count"] = count_result.count or 0
        return OrganizationWithStats(**result.data)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching organization: {e}")
        raise HTTPException(
            status_code=500, detail="Error fetching organization"
        ) from e


@router.patch("/organizations/{org_id}", response_model=OrganizationWithStats)
async def update_organization(
    org_id: UUID,
    org_in: OrganizationUpdateAdmin,
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """Update an organization (Platform Admin only)."""
    try:
        # Build update data (only non-None fields)
        update_data = org_in.model_dump(exclude_unset=True, exclude_none=True)

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        result = (
            await db.table("organizations")
            .update(update_data)
            .eq("id", str(org_id))
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Get member count
        count_result = (
            await db.table("organization_members")
            .select("id", count="exact", head=True)
            .eq("organization_id", str(org_id))
            .eq("status", "active")
            .execute()
        )

        result.data[0]["member_count"] = count_result.count or 0
        return OrganizationWithStats(**result.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating organization: {e}")
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=400, detail="Organization with this slug already exists"
            ) from e
        raise HTTPException(status_code=500, detail="Error updating organization") from e


@router.delete("/organizations/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: UUID,
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """Delete an organization and its memberships (Platform Admin only)."""
    try:
        # Delete memberships first
        await db.table("organization_members").delete().eq(
            "organization_id", str(org_id)
        ).execute()

        # Delete organization
        result = (
            await db.table("organizations").delete().eq("id", str(org_id)).execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Organization not found")

        return None

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting organization: {e}")
        raise HTTPException(status_code=500, detail="Error deleting organization") from e


# ============================================================================
# Users List (for owner selection)
# ============================================================================


@router.get("/users", response_model=PaginatedUsersResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Search by email or name"),
    admin: dict = Depends(PlatformAdminRequired()),  # noqa: B008
    db=Depends(get_admin_client),  # noqa: B008
):
    """List all users for owner selection (Platform Admin only)."""
    try:
        query = db.table("profiles").select(
            "id, email, full_name, avatar_url",
            count="exact",
        )

        # Apply search filter
        if search:
            query = query.or_(f"email.ilike.%{search}%,full_name.ilike.%{search}%")

        # Apply pagination
        query = query.order("email").range(skip, skip + limit - 1)

        result = await query.execute()

        items = [UserBasicInfo(**user) for user in result.data]

        return PaginatedUsersResponse(
            items=items,
            total=result.count or 0,
            skip=skip,
            limit=limit,
        )

    except Exception as e:
        logging.error(f"Error listing users: {e}")
        raise HTTPException(status_code=500, detail="Error listing users") from e
