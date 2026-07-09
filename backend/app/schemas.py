from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from uuid import UUID


class InteractionBase(BaseModel):
    hcp_name: Optional[str] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[date] = None
    interaction_time: Optional[time] = None
    attendees: Optional[str] = None
    topics_discussed: Optional[str] = None
    materials_shared: Optional[str] = None
    samples_distributed: Optional[str] = None
    sentiment: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None


class InteractionCreate(InteractionBase):
    pass


class InteractionUpdate(InteractionBase):
    pass


class InteractionResponse(InteractionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str
    interaction_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    interaction: Optional[InteractionResponse] = None
    tool_used: Optional[str] = None
