"""
LangGraph Agent for HCP Interaction CRM.
Implements the ReAct pattern: LLM decides which tool to call based on user message.
Uses Groq with gemma2-9b-it model.
"""

from typing import Annotated, TypedDict, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.config import settings
from app.agent.tools import (
    log_interaction,
    edit_interaction,
    get_interaction_summary,
    suggest_followups,
    validate_interaction,
)

# Define the tools available to the agent
tools = [
    log_interaction,
    edit_interaction,
    get_interaction_summary,
    suggest_followups,
    validate_interaction,
]

SYSTEM_PROMPT = """You are an AI assistant for a pharmaceutical CRM system, helping field representatives log and manage their interactions with Healthcare Professionals (HCPs).

Your capabilities:
1. **Log Interaction** - Create new interaction records from natural language descriptions. Extract HCP name, date, topics, sentiment, materials shared, etc.
2. **Edit Interaction** - Modify existing interaction records when the user wants to update details.
3. **Get Interaction Summary** - Provide a concise summary of a logged interaction.
4. **Suggest Follow-ups** - Generate intelligent follow-up action suggestions based on the interaction context.
5. **Validate Interaction** - Check if all required fields are filled before submission.

Guidelines:
- When the user describes a meeting/call/interaction, use the log_interaction tool to record it.
- Extract as much information as possible from the user's natural language input.
- For dates, convert relative dates (e.g., "today", "yesterday") to ISO format (YYYY-MM-DD).
- For sentiment, infer from context: "went well" = positive, "concerns" = negative, etc.
- Always confirm what was logged/updated back to the user.
- If an interaction_id is needed but not provided, ask the user or use the most recent one.
- Be concise but helpful in your responses.
"""


class AgentState(TypedDict):
    """State maintained throughout the agent's execution."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


def create_agent():
    """Create and compile the LangGraph agent."""
    # Initialize the Groq LLM with gemma2-9b-it
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )

    # Bind tools to the LLM
    llm_with_tools = llm.bind_tools(tools)

    # Define the agent node
    def agent_node(state: AgentState):
        """The agent node that calls the LLM."""
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    # Define the routing function
    def should_continue(state: AgentState):
        """Determine if the agent should call a tool or end."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END

    # Build the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(tools))

    # Set entry point
    workflow.set_entry_point("agent")

    # Add edges
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")

    # Compile the graph
    return workflow.compile()


# Singleton instance
agent = None


def get_agent():
    """Get or create the agent singleton."""
    global agent
    if agent is None:
        agent = create_agent()
    return agent
