from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import (
    ReminderSettingResponse,
    ReminderSettingUpdate,
    ReminderCheckResponse,
)
from ..security import get_current_user
from ..phase3_crud import (
    get_or_create_reminder_settings,
    update_reminder_settings,
    evaluate_reminders,
)

router = APIRouter(prefix="/api/reminders", tags=["Reminders & Alerts"])


@router.get("/settings", response_model=ReminderSettingResponse)
def read_reminder_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_or_create_reminder_settings(db, user_id=current_user.id)


@router.put("/settings", response_model=ReminderSettingResponse)
def save_reminder_settings(
    settings_in: ReminderSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_reminder_settings(db, user_id=current_user.id, settings_in=settings_in)


@router.post("/check", response_model=ReminderCheckResponse)
def trigger_due_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return evaluate_reminders(db, user_id=current_user.id)

