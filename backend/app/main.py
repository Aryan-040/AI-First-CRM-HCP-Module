from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import interactions, chat

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HCP Interaction CRM",
    description="AI-First CRM HCP Module - Log Interaction Screen",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interactions.router, prefix="/api/interactions", tags=["interactions"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/")
def health_check():
    return {"status": "healthy", "service": "HCP CRM Backend"}
