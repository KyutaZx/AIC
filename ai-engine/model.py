"""AquaRoute AI visual model: MobileNetV3-Small, 3-class tier classifier."""

import os
from typing import Dict, Optional

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

CLASS_NAMES = ["Tier1_Kritis", "Tier2_Sedang", "Tier3_Prima"]

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best_visual.pt")

_IMAGENET_MEAN = [0.485, 0.456, 0.406]
_IMAGENET_STD = [0.229, 0.224, 0.225]

_preprocess = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=_IMAGENET_MEAN, std=_IMAGENET_STD),
    ]
)

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_model: Optional["AquaRouteVisualModel"] = None


class AquaRouteVisualModel(nn.Module):
    """MobileNetV3-Small backbone with a 3-class classification head (matches training architecture)."""

    def __init__(self, num_classes: int = len(CLASS_NAMES)) -> None:
        super().__init__()
        backbone = models.mobilenet_v3_small(weights=None)
        self.visual = nn.Sequential(
            backbone.features,
            backbone.avgpool,
            nn.Flatten(),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(576, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes),
        )

    def forward(self, img: torch.Tensor) -> torch.Tensor:
        """Forward pass, returns raw class logits of shape (batch, num_classes)."""
        v = self.visual(img)
        return self.classifier(v)


def load_model() -> AquaRouteVisualModel:
    """Load best_visual.pt from disk once and cache it in memory.

    Raises FileNotFoundError with a clear message if the weights file is missing,
    since best_visual.pt is not checked into the repo and must be copied in manually.
    """
    global _model

    if not os.path.isfile(MODEL_PATH):
        raise FileNotFoundError(
            f"Model weights not found at '{MODEL_PATH}'. "
            "Copy best_visual.pt into the ai-engine/ directory before starting "
            "the AI Engine (see CLAUDE.md: model backup is on Google Drive)."
        )

    model = AquaRouteVisualModel()
    state_dict = torch.load(MODEL_PATH, map_location=_device)
    model.load_state_dict(state_dict)
    model.to(_device)
    model.eval()

    _model = model
    return model


def get_model() -> AquaRouteVisualModel:
    """Return the cached model instance, raising if load_model() has not run yet."""
    if _model is None:
        raise RuntimeError("Model has not been loaded. Call load_model() at startup first.")
    return _model


def predict(image: Image.Image) -> Dict[str, object]:
    """Run inference on a PIL image and return tier, confidence, and per-class probabilities."""
    model = get_model()

    tensor = _preprocess(image.convert("RGB")).unsqueeze(0).to(_device)

    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1).squeeze(0)

    probs = {name: float(probabilities[i]) for i, name in enumerate(CLASS_NAMES)}
    tier = max(probs, key=probs.get)
    confidence = probs[tier]

    return {
        "tier": tier,
        "confidence": confidence,
        "probabilities": probs,
    }
