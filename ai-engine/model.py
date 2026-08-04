"""AquaRoute AI visual model: MobileNetV3-Small, 3-class tier classifier."""

import base64
import io
import os
from typing import Dict, Optional

import numpy as np
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
_gradcam: Optional["GradCAM"] = None


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


class GradCAM:
    """Basic Grad-CAM heatmap generator on the final feature layer.

    This deliberately uses textbook Grad-CAM (plain gradient averaging) on the
    last convolutional block, replacing the earlier Grad-CAM++ on the 14x14
    block-8 layer. The earlier variant was hand-tuned against the *original*
    model and did not transfer to the retrained (leak-free split) model: with
    the retrained classifier the block-8 Grad-CAM++ heatmaps degraded into
    scattered noise instead of focusing on the fish. This is a transferability
    fix — the previous code was not "wrong", it was just over-fit to one set of
    weights. See docs/FINDINGS.md.

    Design:

    1. Target layer = ``model.visual[0]`` (the whole backbone.features / final
       block output), not an index into a specific inner block. The gradients of
       the retrained classifier are cleaner and more stable at the final feature
       map than at the mid-network 14x14 block.
    2. Plain channel weighting: ``weights = gradients.mean(dim=(2,3))``, i.e.
       average pooled gradients per channel, then ``cam = (weights * acts).sum``.
       No Grad-CAM++ alpha terms.

    The model weights are never touched; this is an inference-time visualization
    change only.
    """

    def __init__(self, model: AquaRouteVisualModel) -> None:
        self.model = model
        # model.visual[0] is backbone.features — hook the final feature block output.
        self.target_layer = model.visual[0]
        self._activations: Optional[torch.Tensor] = None
        self._gradients: Optional[torch.Tensor] = None
        self.target_layer.register_forward_hook(self._save_activation)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, inputs, output) -> None:
        self._activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output) -> None:
        self._gradients = grad_output[0].detach()

    def generate(self, tensor: torch.Tensor, class_idx: int) -> np.ndarray:
        """Return a normalized (0-1) HxW class activation map for class_idx (basic Grad-CAM)."""
        self.model.zero_grad()
        logits = self.model(tensor)
        score = logits[0, class_idx]
        score.backward()

        grads = self._gradients  # (1, C, H, W)
        acts = self._activations  # (1, C, H, W)

        # Basic Grad-CAM: weight each channel by its mean gradient (global average
        # pool over spatial dims), then take the weighted sum of activations.
        weights = grads.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)
        cam = (weights * acts).sum(dim=1).squeeze(0)  # (H, W)
        cam = torch.relu(cam)

        cam = cam - cam.min()
        cam_max = cam.max()
        if cam_max > 0:
            cam = cam / cam_max
        return cam.cpu().numpy()


def _jet_colormap(gray: np.ndarray) -> np.ndarray:
    """Map a 0-1 grayscale array to a jet-style RGB array (0-255, uint8-ready)."""
    x = np.clip(gray, 0.0, 1.0)
    four = 4.0 * x
    r = np.clip(np.minimum(four - 1.5, -four + 4.5), 0.0, 1.0)
    g = np.clip(np.minimum(four - 0.5, -four + 3.5), 0.0, 1.0)
    b = np.clip(np.minimum(four + 0.5, -four + 2.5), 0.0, 1.0)
    return np.stack([r, g, b], axis=-1) * 255.0


def _overlay_heatmap(image: Image.Image, cam: np.ndarray, alpha: float = 0.4) -> str:
    """Resize cam to 224x224, colorize, alpha-blend over the photo, return base64 JPEG."""
    base = image.convert("RGB").resize((224, 224))
    base_arr = np.asarray(base).astype(np.float32)

    # cam is a small map (e.g. 7x7); upscale to the display size with interpolation.
    cam_img = Image.fromarray((cam * 255).astype(np.uint8)).resize((224, 224), Image.BILINEAR)
    cam_resized = np.asarray(cam_img).astype(np.float32) / 255.0

    heatmap = _jet_colormap(cam_resized)
    overlay = (1.0 - alpha) * base_arr + alpha * heatmap
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)

    buffer = io.BytesIO()
    Image.fromarray(overlay).save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode("ascii")


def load_model() -> AquaRouteVisualModel:
    """Load best_visual.pt from disk once and cache it in memory.

    Raises FileNotFoundError with a clear message if the weights file is missing,
    since best_visual.pt is not checked into the repo and must be copied in manually.
    """
    global _model, _gradcam

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
    _gradcam = GradCAM(model)
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


def generate_heatmap(image: Image.Image, class_name: str) -> Optional[str]:
    """Generate a Grad-CAM overlay (base64 JPEG) for the given predicted class.

    Runs synchronously as part of the same request. Returns None if the model
    has not been loaded yet.
    """
    if _gradcam is None:
        return None

    rgb = image.convert("RGB")
    class_idx = CLASS_NAMES.index(class_name)
    tensor = _preprocess(rgb).unsqueeze(0).to(_device)

    # The target layer sits inside a partially-frozen backbone, so the backward
    # hook only fires if the input tensor itself requires grad — otherwise the
    # gradients never flow and _gradients stays None ("NoneType has no attribute").
    tensor.requires_grad_(True)

    cam = _gradcam.generate(tensor, class_idx)
    return _overlay_heatmap(rgb, cam)
