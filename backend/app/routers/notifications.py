from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Notification
from ..schemas import NotificationResponse
from ..security import get_current_user
from ..crud import (
    get_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    trigger_daily_reminders_if_needed
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve notifications for the user; automatically checks if daily workout reminder is due."""
    trigger_daily_reminders_if_needed(db, current_user.id)
    return get_notifications(db=db, user_id=current_user.id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notif = mark_notification_read(db=db, notif_id=notification_id, user_id=current_user.id)
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )
    return notif

@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all unread notifications as read for current user."""
    count = mark_all_notifications_read(db=db, user_id=current_user.id)
    return {"detail": f"{count} notifications marked as read."}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a notification."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found or access denied."
        )
    db.delete(notif)
    db.commit()
    return {"detail": "Notification deleted"}
