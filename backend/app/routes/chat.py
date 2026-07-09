from typing import Optional

from fastapi import APIRouter
from langchain_core.messages import HumanMessage, AIMessage
from uuid import UUID

from app.schemas import ChatRequest, ChatResponse, InteractionResponse
from app.agent.graph import get_agent
from app.database import SessionLocal
from app.models import Interaction

router = APIRouter()

# Simple in-memory message history per session (for demo purposes)
message_history: list = []


def _get_latest_interaction_response(tool_output: str) -> Optional[dict]:
    """Parse tool output and fetch interaction if ID is present."""
    if not tool_output or "ERROR" in tool_output:
        return None
    parts = tool_output.split("|")
    if len(parts) >= 2:
        try:
            interaction_id = UUID(parts[1])
            db = SessionLocal()
            try:
                interaction = (
                    db.query(Interaction)
                    .filter(Interaction.id == interaction_id)
                    .first()
                )
                if interaction:
                    return InteractionResponse.model_validate(interaction).model_dump(
                        mode="json"
                    )
            finally:
                db.close()
        except (ValueError, IndexError):
            pass
    return None


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the LangGraph agent and get a response."""
    global message_history

    agent = get_agent()

    # Add context about the current interaction if provided
    user_message = request.message
    if request.interaction_id:
        user_message += f"\n[Current interaction_id: {request.interaction_id}]"

    # Build messages for this invocation
    input_messages = message_history + [HumanMessage(content=user_message)]

    # Invoke the agent
    result = agent.invoke({"messages": input_messages})

    # Extract the final AI response
    all_messages = result["messages"]
    ai_response = ""
    tool_used = None
    interaction_data = None

    # Walk through messages to find tool calls and final response
    for msg in all_messages:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            tool_used = msg.tool_calls[0]["name"]
        if isinstance(msg, AIMessage) and msg.content and not msg.tool_calls:
            ai_response = msg.content

    # Check tool messages for interaction data
    for msg in all_messages:
        if hasattr(msg, "content") and msg.type == "tool":
            interaction_data = _get_latest_interaction_response(msg.content)
            if interaction_data:
                break

    # Update message history (keep last 20 messages for context)
    message_history = list(all_messages)[-20:]

    return ChatResponse(
        reply=ai_response or "I processed your request.",
        interaction=interaction_data,
        tool_used=tool_used,
    )


@router.delete("/history")
async def clear_history():
    """Clear the chat message history."""
    global message_history
    message_history = []
    return {"detail": "Chat history cleared"}
