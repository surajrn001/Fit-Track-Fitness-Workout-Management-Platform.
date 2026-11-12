from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    IntegrationStatusResponse,
    IntegrationSyncRequest,
    IntegrationSyncResponse,
)
from ..security import get_current_user
from ..phase3_crud import (
    get_integrations,
    connect_integration,
    disconnect_integration,
    sync_integration,
)

router = APIRouter(prefix="/api/integrations", tags=["Third-Party Integrations"])


@router.get("/", response_model=List[IntegrationStatusResponse])
def list_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_integrations(db, user_id=current_user.id)


@router.post("/{provider}/connect", response_model=IntegrationStatusResponse)
def link_provider(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return connect_integration(db, user_id=current_user.id, provider=provider)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/{provider}/disconnect", response_model=IntegrationStatusResponse)
def unlink_provider(
    provider: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return disconnect_integration(db, user_id=current_user.id, provider=provider)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/{provider}/sync", response_model=IntegrationSyncResponse)
def sync_provider_activity(
    provider: str,
    sync_req: Optional[IntegrationSyncRequest] = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return sync_integration(db, user_id=current_user.id, provider=provider, sync_req=sync_req)
    except (ValueError, PermissionError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

