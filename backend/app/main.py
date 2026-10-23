"""
Main FastAPI Application Entrypoint for AI Smell & Flavor Synthesizer.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.constants import SCIENTIFIC_DISCLAIMER
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        f"{settings.PROJECT_SUBTITLE}\n\n"
        "A research-grade computational sensory science platform connecting "
        "Chemical Molecular Structures -> Food Ingredients -> Sensory Perception -> Generative Formulation.\n\n"
        f"**Notice**: {SCIENTIFIC_DISCLAIMER}"
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration allowing local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "version": settings.VERSION,
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
        "disclaimer": SCIENTIFIC_DISCLAIMER
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

