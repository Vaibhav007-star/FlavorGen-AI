"""
Core Configuration and Environment Settings for AI Smell & Flavor Synthesizer.
"""

from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base project directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
DEMO_DATA_DIR = DATA_DIR / "demo"
MODELS_DIR = BASE_DIR / "ml" / "saved_models"

for directory in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, DEMO_DATA_DIR, MODELS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "FlavorGen AI"
    PROJECT_SUBTITLE: str = "AI Flavor & Fragrance Synthesis Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment mode: 'development', 'testing', 'production'
    ENVIRONMENT: str = Field(default="development")
    DEMO_MODE: bool = Field(default=True, description="Enable self-contained demo mode without external dependencies")
    
    # Database
    SQLITE_DB_PATH: Path = PROCESSED_DATA_DIR / "sensory_synthesizer.db"
    DATABASE_URL: str = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"
    
    # Cheminformatics
    FINGERPRINT_RADIUS: int = 2
    FINGERPRINT_NBITS: int = 256
    USE_RDKIT_IF_AVAILABLE: bool = True
    
    # ML Models
    RANDOM_STATE: int = 42
    CONFIDENCE_THRESHOLD: float = 0.65
    
    # Vector Search
    TOP_K_SIMILARITY: int = 5
    
    # LLM Assistant (Optional integration, fallback to heuristic reasoning)
    LLM_API_KEY: str = Field(default="", description="Optional API key for external LLM sensory assistant")
    LLM_MODEL: str = "gemini-1.5-pro"
    
    # Model configuration
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

