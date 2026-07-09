import uuid
from datetime import datetime, date, time
from typing import Optional

from sqlalchemy import String, Text, Date, Time, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hcp_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    interaction_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    interaction_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    interaction_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    attendees: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    topics_discussed: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    materials_shared: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    samples_distributed: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sentiment: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    outcomes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    follow_up_actions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
