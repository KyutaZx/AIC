"""AquaRoute AI Engine — FastAPI app, routing and startup only."""

import base64
import binascii
import io
import logging

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

from model import load_model, predict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-engine")

app = FastAPI(title="AquaRoute AI Engine")


class InferenceRequest(BaseModel):
    image_base64: str


class InferenceResponse(BaseModel):
    tier: str
    confidence: float
    probabilities: dict[str, float]


@app.on_event("startup")
async def startup() -> None:
    """Load model weights once when the service starts, not per request."""
    logger.info("Loading AquaRoute visual model from disk...")
    load_model()
    logger.info("Model loaded successfully.")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception) -> JSONResponse:
    """Return a consistent JSON error envelope for unhandled exceptions."""
    logger.exception("Unhandled error during request")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "tier": None, "confidence": None},
    )


@app.post("/ai/inference", response_model=InferenceResponse)
async def inference(payload: InferenceRequest) -> InferenceResponse:
    """Decode the incoming image, run the visual model, and return tier probabilities."""
    try:
        image_bytes = base64.b64decode(payload.image_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {exc}")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Uploaded data is not a valid image")

    result = predict(image)
    return InferenceResponse(**result)
