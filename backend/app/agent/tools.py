"""
LangGraph Tools for HCP Interaction CRM.
Defines 5 tools used by the AI agent:
1. log_interaction - Create a new interaction from natural language
2. edit_interaction - Modify fields of an existing interaction
3. get_interaction_summary - Summarize an interaction's details
4. suggest_followups - Generate AI-powered follow-up suggestions
5. validate_interaction - Check for missing required fields
"""

from datetime import date, time, datetime
from typing import Optional
from uuid import UUID
import re

from langchain_core.tools import tool
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Interaction


def _get_db() -> Session:
    return SessionLocal()


def normalize_hcp_name(hcp_name: Optional[str]) -> Optional[str]:
    """Return a cleaned HCP name or None if it looks like a placeholder."""
    if not hcp_name:
        return None

    cleaned = re.sub(r"\s+", " ", hcp_name).strip()
    if not cleaned:
        return None

    lowered = cleaned.lower()
    placeholders = {
        "doctor smith",
        "dr. smith",
        "dr smith",
        "smith",
        "doctor",
        "hcp",
        "unknown",
        "n/a",
        "none",
    }
    if lowered in placeholders:
        return None

    if re.fullmatch(r"(?:dr\.?|doctor)\s+smith", lowered):
        return None

    return cleaned


@tool
def log_interaction(
    hcp_name: str,
    interaction_type: Optional[str] = "Meeting",
    interaction_date: Optional[str] = None,
    interaction_time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = "neutral",
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None,
) -> str:
    """Log a new HCP interaction. Use this tool when the user describes a meeting, call, or any interaction with a healthcare professional. Extract all relevant details from the user's message."""
    db = _get_db()
    try:
        normalized_name = normalize_hcp_name(hcp_name)
        if not normalized_name:
            return "ERROR|HCP name is required and cannot be a placeholder."

        parsed_date = None
        if interaction_date:
            try:
                parsed_date = date.fromisoformat(interaction_date)
            except ValueError:
                parsed_date = date.today()
        else:
            parsed_date = date.today()

        parsed_time = None
        if interaction_time:
            try:
                parsed_time = time.fromisoformat(interaction_time)
            except ValueError:
                parsed_time = None

        interaction = Interaction(
            hcp_name=normalized_name,
            interaction_type=interaction_type,
            interaction_date=parsed_date,
            interaction_time=parsed_time,
            attendees=attendees,
            topics_discussed=topics_discussed,
            materials_shared=materials_shared,
            samples_distributed=samples_distributed,
            sentiment=sentiment,
            outcomes=outcomes,
            follow_up_actions=follow_up_actions,
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return f"SUCCESS|{interaction.id}|Interaction logged successfully for {normalized_name}."
    except Exception as e:
        db.rollback()
        return f"ERROR|Failed to log interaction: {str(e)}"
    finally:
        db.close()


@tool
def edit_interaction(
    interaction_id: str,
    hcp_name: Optional[str] = None,
    interaction_type: Optional[str] = None,
    interaction_date: Optional[str] = None,
    interaction_time: Optional[str] = None,
    attendees: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    materials_shared: Optional[str] = None,
    samples_distributed: Optional[str] = None,
    sentiment: Optional[str] = None,
    outcomes: Optional[str] = None,
    follow_up_actions: Optional[str] = None,
) -> str:
    """Edit an existing HCP interaction. Use this tool when the user wants to update or modify any fields of a previously logged interaction. Only update the fields that the user specifically mentions."""
    db = _get_db()
    try:
        interaction = (
            db.query(Interaction)
            .filter(Interaction.id == UUID(interaction_id))
            .first()
        )
        if not interaction:
            return "ERROR|Interaction not found."

        if hcp_name:
            interaction.hcp_name = hcp_name
        if interaction_type:
            interaction.interaction_type = interaction_type
        if interaction_date:
            try:
                interaction.interaction_date = date.fromisoformat(interaction_date)
            except ValueError:
                pass
        if interaction_time:
            try:
                interaction.interaction_time = time.fromisoformat(interaction_time)
            except ValueError:
                pass
        if attendees:
            interaction.attendees = attendees
        if topics_discussed:
            interaction.topics_discussed = topics_discussed
        if materials_shared:
            interaction.materials_shared = materials_shared
        if samples_distributed:
            interaction.samples_distributed = samples_distributed
        if sentiment:
            interaction.sentiment = sentiment
        if outcomes:
            interaction.outcomes = outcomes
        if follow_up_actions:
            interaction.follow_up_actions = follow_up_actions

        db.commit()
        db.refresh(interaction)
        return f"SUCCESS|{interaction.id}|Interaction updated successfully."
    except Exception as e:
        db.rollback()
        return f"ERROR|Failed to edit interaction: {str(e)}"
    finally:
        db.close()


@tool
def get_interaction_summary(interaction_id: str) -> str:
    """Get a concise summary of an HCP interaction. Use this tool when the user asks to summarize or review a logged interaction."""
    db = _get_db()
    try:
        interaction = (
            db.query(Interaction)
            .filter(Interaction.id == UUID(interaction_id))
            .first()
        )
        if not interaction:
            return "ERROR|Interaction not found."

        parts = []
        if interaction.hcp_name:
            parts.append(f"HCP: {interaction.hcp_name}")
        if interaction.interaction_type:
            parts.append(f"Type: {interaction.interaction_type}")
        if interaction.interaction_date:
            parts.append(f"Date: {interaction.interaction_date.isoformat()}")
        if interaction.interaction_time:
            parts.append(f"Time: {interaction.interaction_time.isoformat()}")
        if interaction.attendees:
            parts.append(f"Attendees: {interaction.attendees}")
        if interaction.topics_discussed:
            parts.append(f"Topics: {interaction.topics_discussed}")
        if interaction.materials_shared:
            parts.append(f"Materials Shared: {interaction.materials_shared}")
        if interaction.samples_distributed:
            parts.append(f"Samples: {interaction.samples_distributed}")
        if interaction.sentiment:
            parts.append(f"Sentiment: {interaction.sentiment}")
        if interaction.outcomes:
            parts.append(f"Outcomes: {interaction.outcomes}")
        if interaction.follow_up_actions:
            parts.append(f"Follow-ups: {interaction.follow_up_actions}")

        summary = " | ".join(parts) if parts else "No details recorded yet."
        return f"SUCCESS|{interaction.id}|{summary}"
    except Exception as e:
        return f"ERROR|Failed to get summary: {str(e)}"
    finally:
        db.close()


@tool
def suggest_followups(interaction_id: str) -> str:
    """Suggest follow-up actions based on an HCP interaction. Use this tool when the user asks for suggestions on next steps or follow-up actions after an interaction."""
    db = _get_db()
    try:
        interaction = (
            db.query(Interaction)
            .filter(Interaction.id == UUID(interaction_id))
            .first()
        )
        if not interaction:
            return "ERROR|Interaction not found."

        suggestions = []
        if interaction.sentiment == "positive":
            suggestions.append("Schedule a follow-up meeting in 2 weeks to maintain momentum")
        elif interaction.sentiment == "negative":
            suggestions.append("Address concerns raised and schedule a call within 3 days")
        else:
            suggestions.append("Schedule follow-up meeting in 1 week")

        if interaction.materials_shared:
            suggestions.append(f"Send digital copies of shared materials: {interaction.materials_shared}")
        else:
            suggestions.append("Prepare and share relevant product materials")

        if interaction.topics_discussed:
            suggestions.append(f"Prepare updated data on discussed topics: {interaction.topics_discussed}")

        suggestions.append("Update internal CRM notes with key takeaways")
        suggestions.append(f"Add {interaction.hcp_name or 'HCP'} to advisory board invite list if appropriate")

        return f"SUCCESS|{interaction.id}|" + "\n".join(f"• {s}" for s in suggestions)
    except Exception as e:
        return f"ERROR|Failed to suggest followups: {str(e)}"
    finally:
        db.close()


@tool
def validate_interaction(interaction_id: str) -> str:
    """Validate an interaction for completeness before submission. Use this tool when the user asks to check or validate if an interaction has all required information filled in."""
    db = _get_db()
    try:
        interaction = (
            db.query(Interaction)
            .filter(Interaction.id == UUID(interaction_id))
            .first()
        )
        if not interaction:
            return "ERROR|Interaction not found."

        errors = []
        if not interaction.hcp_name:
            errors.append("HCP Name is missing")
        if not interaction.interaction_type:
            errors.append("Interaction Type is missing")
        if not interaction.interaction_date:
            errors.append("Interaction Date is missing")
        if not interaction.topics_discussed:
            errors.append("Topics Discussed is missing")
        if not interaction.sentiment:
            errors.append("HCP Sentiment is missing")
        if not interaction.outcomes:
            errors.append("Outcomes are missing")
        if not interaction.follow_up_actions:
            errors.append("Follow-up Actions are missing")

        if errors:
            return f"VALIDATION_FAILED|{interaction.id}|" + "; ".join(errors)
        else:
            return f"VALIDATION_PASSED|{interaction.id}|All required fields are complete. Interaction is ready for submission."
    except Exception as e:
        return f"ERROR|Failed to validate: {str(e)}"
    finally:
        db.close()
