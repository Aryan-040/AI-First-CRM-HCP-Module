from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Interaction
from app.schemas import InteractionCreate, InteractionUpdate, InteractionResponse

router = APIRouter()


@router.get("/", response_model=List[InteractionResponse])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).all()


@router.get("/{interaction_id}", response_model=InteractionResponse)
def get_interaction(interaction_id: UUID, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


@router.post("/", response_model=InteractionResponse)
def create_interaction(data: InteractionCreate, db: Session = Depends(get_db)):
    interaction = Interaction(**data.model_dump(exclude_unset=True))
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: UUID, data: InteractionUpdate, db: Session = Depends(get_db)
):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interaction, key, value)

    db.commit()
    db.refresh(interaction)
    return interaction


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: UUID, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(interaction)
    db.commit()
    return {"detail": "Interaction deleted"}