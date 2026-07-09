from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/hcp_crm"

    class Config:
        env_file = ".env"


settings = Settings()
