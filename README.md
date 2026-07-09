# AI-First CRM HCP Module – Log Interaction Screen

An AI-powered CRM system for pharmaceutical field representatives to log and manage Healthcare Professional (HCP) interactions. Features a split-screen interface with a structured form and an AI conversational assistant powered by LangGraph.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Redux Toolkit, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| AI Agent | LangGraph, LangChain, Groq (gemma2-9b-it) |
| Database | PostgreSQL |
| Font | Google Inter |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  React + Redux + Tailwind CSS                   │
│  ┌───────────────────┬─────────────────────┐    │
│  │  Interaction Form │   AI Chat Panel     │    │
│  │  (Structured)     │   (Conversational)  │    │
│  └───────────────────┴─────────────────────┘    │
└─────────────────────┬───────────────────────────┘
                      │ REST API
┌─────────────────────┴───────────────────────────┐
│                   Backend                        │
│  FastAPI + SQLAlchemy                           │
│  ┌─────────────────────────────────────────┐    │
│  │          LangGraph Agent                 │    │
│  │  ┌─────┐  ┌──────┐  ┌──────────────┐   │    │
│  │  │ LLM │→ │Tools │→ │ Tool Router  │   │    │
│  │  └─────┘  └──────┘  └──────────────┘   │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────┐
│              PostgreSQL Database                  │
└──────────────────────────────────────────────────┘
```

## LangGraph Agent & Tools

The LangGraph agent uses the **ReAct pattern** — the LLM decides which tool to invoke based on the user's natural language input. No hardcoded if-else logic; the AI model handles all routing decisions.

### 5 Tools Implemented:

1. **`log_interaction`** — Creates a new HCP interaction record. Extracts entities (HCP name, date, sentiment, topics, materials) from natural language input using the LLM.

2. **`edit_interaction`** — Modifies specific fields of an existing interaction. Only updates fields the user explicitly mentions.

3. **`get_interaction_summary`** — Generates a concise summary of a logged interaction's details.

4. **`suggest_followups`** — Provides AI-powered follow-up action suggestions based on the interaction context (sentiment, topics discussed, materials shared).

5. **`validate_interaction`** — Checks if all required fields are filled before submission and reports any missing information.

## Project Structure

```
logger/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── graph.py        # LangGraph state graph definition
│   │   │   └── tools.py        # 5 LangGraph tools
│   │   ├── routes/
│   │   │   ├── chat.py         # POST /api/chat endpoint
│   │   │   └── interactions.py # CRUD /api/interactions
│   │   ├── config.py           # Environment settings
│   │   ├── database.py         # SQLAlchemy setup
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── models.py           # SQLAlchemy models
│   │   └── schemas.py          # Pydantic schemas
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx          # AI chat interface
│   │   │   ├── InteractionForm.tsx    # Structured form
│   │   │   └── LogInteractionScreen.tsx # Split-screen layout
│   │   ├── store/
│   │   │   ├── chatSlice.ts           # Chat Redux slice
│   │   │   ├── interactionSlice.ts    # Interaction Redux slice
│   │   │   └── index.ts              # Store configuration
│   │   ├── services/
│   │   │   └── api.ts                # Axios API client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Setup & Running

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Groq API key (get one at https://console.groq.com)

### 1. Database Setup

```bash
# Create the PostgreSQL database
createdb hcp_crm

# Or using psql:
psql -U postgres -c "CREATE DATABASE hcp_crm;"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY and DATABASE_URL

# Run the server
python3 -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hcp_crm
```

## Features Beyond Requirements

- **AI Suggested Follow-ups** — Proactive follow-up suggestions below the form based on interaction context
- **Interaction History Dashboard** — View and load all past HCP interactions
- **Toast Notifications** — Visual feedback when tools execute (logged, edited, validated)
- **Quick Suggestions** — Pre-built prompts in the chat for common actions
- **Summarize from Voice Note** button — UI-ready for voice transcription integration
- **Responsive Split-Screen** — Clean layout matching the provided mockup

## Usage Examples

### Via AI Chat:
- **Log**: "Met Dr. Smith today, discussed Product X efficacy, positive sentiment, shared brochure"
- **Edit**: "Change the sentiment to negative and add Dr. Jones as an attendee"
- **Summarize**: "Summarize this interaction"
- **Suggest follow-ups**: "What should I do next?"
- **Validate**: "Check if this interaction is ready to submit"

### Via Structured Form:
Fill in the form fields directly on the left panel and click "Save Interaction."

### Via History Dashboard:
Click the "History" button in the header to browse and load past interactions.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Send message to AI agent |
| DELETE | `/api/chat/history` | Clear chat history |
| GET | `/api/interactions/` | List all interactions |
| POST | `/api/interactions/` | Create interaction |
| GET | `/api/interactions/{id}` | Get specific interaction |
| PUT | `/api/interactions/{id}` | Update interaction |
| DELETE | `/api/interactions/{id}` | Delete interaction |
