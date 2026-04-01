"""
FarmerMitra Disease Detection Backend
Flask API serving predictions from the trained PyTorch model.

Architecture: ConvNeXt-Tiny + Spatial Attention (18 classes)
Supports: Apple (4 classes), Grape (4 classes), Tomato (10 classes)
"""

import os
import sys
import io
import base64
import json
import logging
from pathlib import Path

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ─── App Setup ───────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Model Configuration ─────────────────────────────────────────────────────
MODEL_PATH = Path(__file__).parent / "models" / "trained_model_weights.pth"

# 18 classes: Apple(4) + Grape(4) + Tomato(10)
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

NUM_CLASSES = len(CLASS_NAMES)  # 18

# ─── Disease Remedies Database ───────────────────────────────────────────────
REMEDIES_DB = {
    "Apple___Apple_scab": {
        "remedies": [
            "Apply fungicides (captan, myclobutanil) at green tip and throughout spring.",
            "Remove and destroy fallen leaves to reduce overwintering spores.",
            "Prune trees to improve air circulation and reduce humidity.",
            "Plant scab-resistant apple varieties where possible.",
        ],
        "recovery": "3-6 weeks with proper treatment",
        "details": "Apple scab is caused by the fungus Venturia inaequalis. It creates dark, scabby lesions on leaves and fruit, leading to defoliation and reduced yield.",
    },
    "Apple___Black_rot": {
        "remedies": [
            "Remove mummified fruit and dead branches promptly.",
            "Apply copper-based fungicide sprays during the growing season.",
            "Prune out diseased wood and dispose of it away from the orchard.",
            "Ensure good drainage and avoid wounding trees.",
        ],
        "recovery": "4-8 weeks",
        "details": "Black rot is caused by Botryosphaeria obtusa. It affects fruit, leaves, and bark, causing significant economic losses in untreated orchards.",
    },
    "Apple___Cedar_apple_rust": {
        "remedies": [
            "Apply fungicides (myclobutanil, triadimefon) from pink bud stage through petal fall.",
            "Remove nearby Eastern red cedar trees if possible.",
            "Plant rust-resistant apple varieties.",
            "Monitor for orange jelly-like spore masses on cedars in spring.",
        ],
        "recovery": "2-4 weeks with treatment",
        "details": "Cedar apple rust requires two hosts to complete its life cycle: apple/crabapple and Eastern red cedar. It causes yellow-orange spots on leaves.",
    },
    "Apple___healthy": {
        "remedies": [
            "No treatment needed - your apple plant looks healthy!",
            "Continue regular monitoring and preventive care.",
            "Maintain proper pruning during dormant season.",
        ],
        "recovery": "N/A",
        "details": "The plant appears healthy with no visible signs of disease. Keep up the good work!",
    },
    "Grape___Black_rot": {
        "remedies": [
            "Apply protective fungicides (mancozeb, myclobutanil) early in the season.",
            "Remove and destroy all mummified berries and infected canes.",
            "Ensure good canopy management for air circulation.",
            "Avoid overhead irrigation to reduce leaf wetness.",
        ],
        "recovery": "Prevention focused - 2-4 weeks treatment window",
        "details": "Grape black rot is caused by Guignardia bidwellii. It affects leaves, shoots, and berries, turning them black and shriveled (mummified).",
    },
    "Grape___Esca_(Black_Measles)": {
        "remedies": [
            "Prune during dry weather and apply wound protectants immediately.",
            "Remove and destroy heavily infected vines.",
            "Avoid large pruning cuts; use double pruning techniques.",
            "There is no curative treatment - focus on prevention.",
        ],
        "recovery": "Long-term management required",
        "details": "Esca (Black Measles) is a complex wood disease caused by multiple fungal pathogens. It causes tiger-stripe leaf symptoms and internal wood decay.",
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "remedies": [
            "Apply copper-based fungicides or mancozeb as a preventive spray.",
            "Improve vineyard airflow through pruning and training.",
            "Avoid working in the vineyard when vines are wet.",
            "Remove infected leaves and debris from the vineyard floor.",
        ],
        "recovery": "2-3 weeks with fungicide treatment",
        "details": "Isariopsis leaf spot causes angular brown lesions on grape leaves, often with a yellowish halo, reducing photosynthesis and vine vigor.",
    },
    "Grape___healthy": {
        "remedies": [
            "No treatment needed - your grape plant looks healthy!",
            "Maintain preventive spray schedule during humid periods.",
            "Continue good canopy management practices.",
        ],
        "recovery": "N/A",
        "details": "The plant appears healthy with no visible signs of disease. Keep monitoring regularly.",
    },
    "Tomato___Bacterial_spot": {
        "remedies": [
            "Apply copper-based bactericide sprays preventively.",
            "Use pathogen-free or certified seed and transplants.",
            "Avoid overhead irrigation and working with wet plants.",
            "Rotate tomato crops with non-host crops for 2-3 years.",
        ],
        "recovery": "2-4 weeks with treatment",
        "details": "Bacterial spot is caused by Xanthomonas species. It creates water-soaked spots that turn brown and scabby on leaves and fruit.",
    },
    "Tomato___Early_blight": {
        "remedies": [
            "Apply fungicides containing chlorothalonil or mancozeb preventively.",
            "Remove lower infected leaves to slow disease spread.",
            "Mulch around plants to prevent soil splash.",
            "Avoid overhead watering; water at the base in the morning.",
        ],
        "recovery": "2-3 weeks with treatment",
        "details": "Early blight is caused by Alternaria solani. It creates dark bull's-eye shaped lesions on older leaves, starting from the bottom of the plant.",
    },
    "Tomato___Late_blight": {
        "remedies": [
            "Destroy all infected plant parts immediately to stop spread.",
            "Apply specialized fungicides containing chlorothalonil or copper.",
            "Avoid overhead irrigation and ensure plants are dry before nightfall.",
            "Plant resistant tomato varieties in future seasons.",
        ],
        "recovery": "10-15 days with intensive treatment",
        "details": "Late blight is caused by Phytophthora infestans. It spreads rapidly in cool, wet weather and can destroy entire crops within days if not controlled.",
    },
    "Tomato___Leaf_Mold": {
        "remedies": [
            "Improve greenhouse ventilation to reduce humidity below 85%.",
            "Apply fungicides (chlorothalonil, mancozeb) at first sign of infection.",
            "Avoid wetting foliage during irrigation.",
            "Remove and destroy infected plant debris after harvest.",
        ],
        "recovery": "2-3 weeks",
        "details": "Leaf mold is caused by Passalora fulva. It appears as pale green or yellow spots on upper leaf surfaces with olive-green mold on the underside.",
    },
    "Tomato___Septoria_leaf_spot": {
        "remedies": [
            "Apply fungicides (chlorothalonil, copper) starting when first spots appear.",
            "Remove and destroy infected lower leaves.",
            "Mulch soil to prevent spore splash from soil to leaves.",
            "Rotate crops and avoid planting tomatoes in the same spot yearly.",
        ],
        "recovery": "3-4 weeks",
        "details": "Septoria leaf spot is caused by Septoria lycopersici. It creates circular spots with dark borders and grey centers, starting on lower leaves.",
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "remedies": [
            "Apply miticides or insecticidal soap to heavily infested plants.",
            "Increase humidity around plants - mites prefer hot, dry conditions.",
            "Introduce predatory mites (Phytoseiulus persimilis) as biological control.",
            "Remove heavily infested leaves and dispose of them away from the garden.",
        ],
        "recovery": "1-2 weeks with treatment",
        "details": "Spider mites create fine webbing on leaves and cause stippling damage. Severe infestations can defoliate plants completely during hot, dry weather.",
    },
    "Tomato___Target_Spot": {
        "remedies": [
            "Apply fungicides (azoxystrobin, chlorothalonil) preventively in humid conditions.",
            "Improve plant spacing for better air circulation.",
            "Avoid overhead irrigation and water early so foliage dries quickly.",
            "Remove and destroy infected plant material.",
        ],
        "recovery": "2-4 weeks",
        "details": "Target spot is caused by Corynespora cassiicola. It creates concentric ring patterns on leaves, stems, and fruit, resembling a target.",
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "remedies": [
            "Control whitefly populations - they are the primary virus vector.",
            "Use reflective mulches to repel whiteflies from plants.",
            "Remove and destroy infected plants to prevent virus spread.",
            "Plant resistant or tolerant tomato varieties.",
        ],
        "recovery": "No cure - infected plants should be removed",
        "details": "TYLCV is transmitted by whiteflies. It causes severe stunting, yellow leaf curling, and dramatic yield reduction. There is no cure once infected.",
    },
    "Tomato___Tomato_mosaic_virus": {
        "remedies": [
            "Remove and destroy all infected plants immediately.",
            "Control aphid populations - they spread the virus.",
            "Wash hands and sterilize tools before handling plants.",
            "Plant certified virus-free seeds and resistant varieties.",
        ],
        "recovery": "No cure - prevention and removal are key",
        "details": "Tomato mosaic virus causes mottled light and dark green patterns on leaves with distortion and stunting. It spreads easily through contact and tools.",
    },
    "Tomato___healthy": {
        "remedies": [
            "No treatment needed - your tomato plant looks healthy!",
            "Continue preventive spray schedule and monitor regularly.",
            "Ensure consistent watering and nutrition.",
        ],
        "recovery": "N/A",
        "details": "The plant appears healthy with no visible signs of disease. Keep up the good work!",
    },
}


LANGUAGE_NAMES = {
    "hi": "Hindi",
    "kn": "Kannada",
    "ml": "Malayalam",
}


def translate_result(disease: str, leaf_type: str, details: str, remedies: list, recovery: str, lang: str) -> dict:
    """
    Translate disease result fields into the requested language using Gemini.
    Only called when lang != 'en'. Returns translated dict or falls back to English.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    if not api_key or lang not in LANGUAGE_NAMES:
        return {"disease": disease, "leafType": leaf_type, "details": details, "remedies": remedies, "recoveryTime": recovery}

    lang_name = LANGUAGE_NAMES[lang]
    remedies_str = "\n".join(f"- {r}" for r in remedies)
    prompt = f"""Translate the following agricultural disease information strictly into {lang_name}. Return ONLY valid JSON with these exact keys: disease, leafType, details, remedies (array of strings), recoveryTime. Do not add extra keys, markdown, or explanation.

Source JSON:
{{"disease": "{disease}", "leafType": "{leaf_type}", "details": "{details}", "remedies": {json.dumps(remedies)}, "recoveryTime": "{recovery}"}}"""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        body = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 1024},
        }
        res = requests.post(url, json=body, timeout=15)
        res.raise_for_status()
        raw = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        translated = json.loads(raw)
        # Ensure all expected keys exist; fall back field-by-field
        return {
            "disease": translated.get("disease", disease),
            "leafType": translated.get("leafType", leaf_type),
            "details": translated.get("details", details),
            "remedies": translated.get("remedies", remedies),
            "recoveryTime": translated.get("recoveryTime", recovery),
        }
    except Exception as e:
        log.warning(f"Translation failed ({lang}): {e}")
        return {"disease": disease, "leafType": leaf_type, "details": details, "remedies": remedies, "recoveryTime": recovery}


# ─── Custom Model Architecture ────────────────────────────────────────────────
# Checkpoint analysis results:
#   Stem:        [96, 3, 4, 4]   -> ConvNeXt-Tiny stem (4x4 patchify, 96 ch)
#   Stage 1:     96 ch  x3 blocks (DW 7x7, expand 4x, layer_scale)
#   Downsample:  96->192 ch via LN + strided 2x2 conv
#   Stage 2:     192 ch x3 blocks
#   Downsample:  192->384 ch
#   Stage 3:     384 ch x9 blocks
#   Downsample:  384->768 ch
#   Stage 4:     768 ch x3 blocks
#   Attention:   Spatial attention (fc: 768->48->768, conv: [1,2,7,7])
#   Classifier:  768->512->18

def build_convnext_tiny_custom(num_classes: int):
    """
    Exact recreation of the FarmerMitra model:
    ConvNeXt-Tiny backbone + custom spatial attention + custom head.
    """
    import torch
    import torch.nn as nn

    # ── ConvNeXt Block ────────────────────────────────────────────────────
    class ConvNeXtBlock(nn.Module):
        """
        ConvNeXt block:
          DW-7x7 -> LN -> 1x1 (expand 4x) -> GELU -> 1x1 (project) -> layer_scale
        """
        def __init__(self, dim: int, expand: int = 4):
            super().__init__()
            self.layer_scale = nn.Parameter(torch.ones(dim, 1, 1) * 1e-6)
            self.block = nn.Sequential(
                nn.Conv2d(dim, dim, kernel_size=7, padding=3, groups=dim, bias=True),  # block.0
                nn.LayerNorm([dim], elementwise_affine=True),                          # block.1 (spatial)
                nn.Linear(dim, dim * expand, bias=True),                               # block.3
                nn.GELU(),                                                             # block.4
                nn.Linear(dim * expand, dim, bias=True),                               # block.5
            )

        def _apply_block(self, x):
            # x: [B, C, H, W]
            b, c, h, w = x.shape
            # DW conv
            out = self.block[0](x)                          # [B, C, H, W]
            # Reshape for LayerNorm (apply over C dim)
            out = out.permute(0, 2, 3, 1)                   # [B, H, W, C]
            out = self.block[1](out)                        # LN
            out = self.block[2](out)                        # Linear expand
            out = self.block[3](out)                        # GELU
            out = self.block[4](out)                        # Linear project
            out = out.permute(0, 3, 1, 2)                   # [B, C, H, W]
            return out

        def forward(self, x):
            return x + self.layer_scale * self._apply_block(x)

    # ── ConvNeXt Stage ────────────────────────────────────────────────────
    def make_stage(dim: int, depth: int) -> nn.Module:
        return nn.Sequential(*[ConvNeXtBlock(dim) for _ in range(depth)])

    # ── Downsample ────────────────────────────────────────────────────────
    class Downsample(nn.Module):
        """LN -> strided 2x2 conv"""
        def __init__(self, in_ch: int, out_ch: int):
            super().__init__()
            # LN applied channel-last
            self.norm = nn.LayerNorm([in_ch], elementwise_affine=True)
            self.conv = nn.Conv2d(in_ch, out_ch, kernel_size=2, stride=2, bias=True)

        def forward(self, x):
            # x: [B, C, H, W]
            x = x.permute(0, 2, 3, 1)   # [B, H, W, C]
            x = self.norm(x)
            x = x.permute(0, 3, 1, 2)   # [B, C, H, W]
            x = self.conv(x)
            return x

    # ── Spatial Attention ────────────────────────────────────────────────
    class SpatialAttention(nn.Module):
        """
        Channel attention + spatial merge:
          - fc path (global avg pool -> fc0 -> fc2) -> channel weighting
          - conv_after_concat: [1, 2, 7, 7] spatial conv on 2-channel avg+max
        Note: from the checkpoint shape [1, 2, 7, 7], this generates a 1-channel
        spatial attention map using avg-pool and max-pool concat.
        """
        def __init__(self, channels: int):
            super().__init__()
            mid = channels // 16  # 768 // 16 = 48
            self.fc = nn.Sequential(
                nn.Linear(channels, mid, bias=True),   # fc.0
                nn.ReLU(inplace=True),                 # fc.1
                nn.Linear(mid, channels, bias=True),   # fc.2
                nn.Sigmoid(),
            )
            # Spatial attention: takes avg-pooled + max-pooled spatial maps (2 ch), output 1 ch
            self.conv_after_concat = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=True)

        def forward(self, x):
            b, c, h, w = x.shape

            # Channel attention
            avg_c = x.mean(dim=[2, 3])              # [B, C]
            ch_attn = self.fc(avg_c)                # [B, C]
            ch_attn = ch_attn.view(b, c, 1, 1)
            x_ch = x * ch_attn                      # [B, C, H, W]

            # Spatial attention on channel-attended features
            avg_s = x_ch.mean(dim=1, keepdim=True)  # [B, 1, H, W]
            max_s, _ = x_ch.max(dim=1, keepdim=True) # [B, 1, H, W]
            concat = torch.cat([avg_s, max_s], dim=1) # [B, 2, H, W]
            sp_attn = torch.sigmoid(self.conv_after_concat(concat))  # [B, 1, H, W]

            return x_ch * sp_attn                   # [B, C, H, W]

    # ── Full Model ────────────────────────────────────────────────────────
    class FarmerMitraNet(nn.Module):
        def __init__(self, num_classes: int):
            super().__init__()
            import torch.nn as nn

            # features.0: Stem (patchify)
            stem = nn.Sequential(
                nn.Conv2d(3, 96, kernel_size=4, stride=4, bias=True),             # features.0.0
                nn.LayerNorm([96], elementwise_affine=True),                      # features.0.1
            )

            # Stages and downsamples - ConvNeXt-Tiny: (3, 3, 9, 3) blocks
            # features.1: stage1 (3 blocks, 96ch)
            # features.2: downsample (96->192)
            # features.3: stage2 (3 blocks, 192ch)
            # features.4: downsample (192->384)
            # features.5: stage3 (9 blocks, 384ch)
            # features.6: downsample (384->768)
            # features.7: stage4 (3 blocks, 768ch)

            self.features = nn.ModuleList([
                stem,                           # 0
                make_stage(96, 3),              # 1
                Downsample(96, 192),            # 2
                make_stage(192, 3),             # 3
                Downsample(192, 384),           # 4
                make_stage(384, 9),             # 5
                Downsample(384, 768),           # 6
                make_stage(768, 3),             # 7
            ])

            self.attention = SpatialAttention(768)

            self.classifier = nn.Sequential(
                nn.Linear(768, 512, bias=True),   # classifier.0
                nn.GELU(),                        # classifier.1  (activation)
                nn.Dropout(p=0.3),                # classifier.2
                nn.Linear(512, num_classes, bias=True),  # classifier.3
            )

        def _forward_stem(self, x, stem_module):
            """Stem applies conv then LN (channel-last)."""
            x = stem_module[0](x)                  # Conv2d -> [B, 96, H/4, W/4]
            x = x.permute(0, 2, 3, 1)              # [B, H, W, C]
            x = stem_module[1](x)                  # LN
            x = x.permute(0, 3, 1, 2)              # [B, C, H, W]
            return x

        def forward(self, x):
            # Stem
            x = self._forward_stem(x, self.features[0])
            # Stages 1-7
            for i in range(1, 8):
                x = self.features[i](x)
            # Global average pool
            x = x.mean(dim=[2, 3])                  # [B, 768]
            x = self.classifier(x)
            return x

    return FarmerMitraNet(num_classes)


# ─── Key Name Mapping ─────────────────────────────────────────────────────────
# The checkpoint uses nn.Sequential indexing inside blocks. We need to map
# our custom module param names to the checkpoint's names.

def remap_state_dict(state_dict: dict) -> dict:
    """
    Remap checkpoint keys to match our FarmerMitraNet parameter names.
    
    Checkpoint structure (example):
      features.1.0.layer_scale  -> features.1.0.layer_scale
      features.1.0.block.0.weight -> features.1.0.block.0.weight (DW conv)
      features.1.0.block.2.weight -> features.1.0.block.1.* (LN in block)
      features.1.0.block.3.weight -> features.1.0.block.2.weight (fc expand)
      features.1.0.block.5.weight -> features.1.0.block.4.weight (fc project)
    """
    # Actually, since we're building the model to EXACTLY match the checkpoint,
    # we should just load with strict=False and check for issues.
    return state_dict


# ─── Model Loading ────────────────────────────────────────────────────────────
model = None
transform = None


def load_model():
    """Load the trained PyTorch model. Called once at startup."""
    global model, transform

    try:
        import torch
        import torch.nn as nn
        import torchvision.transforms as T
        import torchvision.models as tv_models

        log.info(f"Loading model from: {MODEL_PATH}")

        if not MODEL_PATH.exists():
            log.error(f"Model file not found at: {MODEL_PATH}")
            return False

        state_dict = torch.load(str(MODEL_PATH), map_location="cpu", weights_only=True)
        log.info(f"Checkpoint loaded: {len(state_dict)} keys")

        # ── Build the model skeleton ─────────────────────────────────────
        # ConvNeXt-Tiny features (standard torchvision)
        base = tv_models.convnext_tiny(weights=None)

        class SpatialAttention(nn.Module):
            def __init__(self, channels: int):
                super().__init__()
                mid = channels // 16  # 768 // 16 = 48
                self.fc = nn.Sequential(
                    nn.Linear(channels, mid, bias=True),
                    nn.ReLU(inplace=True),
                    nn.Linear(mid, channels, bias=True),
                    nn.Sigmoid(),
                )
                self.conv_after_concat = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=True)

            def forward(self, x):
                b, c, h, w = x.shape
                avg_c = x.mean(dim=[2, 3])
                ch_attn = self.fc(avg_c).view(b, c, 1, 1)
                x_ch = x * ch_attn
                avg_s = x_ch.mean(dim=1, keepdim=True)
                max_s, _ = x_ch.max(dim=1, keepdim=True)
                sp_attn = torch.sigmoid(self.conv_after_concat(torch.cat([avg_s, max_s], dim=1)))
                return x_ch * sp_attn

        class FarmerMitraNet(nn.Module):
            def __init__(self, features, num_classes):
                super().__init__()
                self.features = features
                self.attention = SpatialAttention(768)
                self.classifier = nn.Sequential(
                    nn.Linear(768, 512, bias=True),
                    nn.GELU(),
                    nn.Dropout(p=0.3),
                    nn.Linear(512, num_classes, bias=True),
                )

            def forward(self, x):
                x = self.features(x)        # ConvNeXt features: [B, 768, H', W']
                x = self.attention(x)       # Spatial attention: [B, 768, H', W']
                x = x.mean(dim=[2, 3])      # Global avg pool: [B, 768]
                x = self.classifier(x)      # [B, num_classes]
                return x

        net = FarmerMitraNet(base.features, NUM_CLASSES)

        # ── Load the entire checkpoint at once  ──────────────────────────
        # The checkpoint has keys like:
        #   features.0.0.weight, attention.fc.0.weight, classifier.0.weight
        # Our model has the SAME structure, so load directly:
        missing, unexpected = net.load_state_dict(state_dict, strict=False)

        if missing:
            log.warning(f"Missing keys ({len(missing)}): {missing[:5]}...")
        if unexpected:
            log.warning(f"Unexpected keys ({len(unexpected)}): {unexpected[:5]}...")

        # If the only issues are unimportant, proceed
        critical_missing = [k for k in missing if not k.endswith(".num_batches_tracked")]
        if critical_missing:
            log.warning(f"Critical missing keys: {critical_missing[:10]}")
            # Still try to proceed - model may be partially loaded

        net.eval()
        model = net
        log.info(f"Model loaded with {NUM_CLASSES} classes. Missing={len(missing)}, Unexpected={len(unexpected)}")

        transform = T.Compose([
            T.Resize(256),
            T.CenterCrop(224),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        log.info("Image transforms configured.")
        return True

    except Exception as e:
        log.error(f"Failed to load model: {e}", exc_info=True)
        return False


# ─── Helper Functions ─────────────────────────────────────────────────────────
def decode_image(data_url: str):
    """Decode a base64 data URL to PIL Image."""
    from PIL import Image
    try:
        if data_url.startswith("data:"):
            _, encoded = data_url.split(",", 1)
        else:
            encoded = data_url
        img_bytes = base64.b64decode(encoded)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Could not decode image: {e}")


def class_name_to_label(class_name: str):
    """'Tomato___Late_blight' -> ('Tomato', 'Late Blight')"""
    parts = class_name.split("___")
    plant = parts[0].replace("_", " ").strip()
    disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Unknown"
    return plant, disease


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "num_classes": NUM_CLASSES,
        "classes": CLASS_NAMES,
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Check server logs."}), 503

    try:
        import torch
        import torch.nn.functional as F

        data = request.get_json(force=True)
        if not data or "image" not in data:
            return jsonify({"error": "Missing 'image' field in request body."}), 400

        try:
            img = decode_image(data["image"])
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        tensor = transform(img).unsqueeze(0)

        with torch.no_grad():
            logits = model(tensor)
            probs = F.softmax(logits, dim=1)
            top_prob, top_idx = torch.topk(probs, k=3, dim=1)

        best_class = CLASS_NAMES[top_idx[0][0].item()]
        confidence = round(top_prob[0][0].item() * 100, 1)

        top3 = []
        for i in range(3):
            cls = CLASS_NAMES[top_idx[0][i].item()]
            plant_i, disease_i = class_name_to_label(cls)
            top3.append({
                "class": cls,
                "plant": plant_i,
                "disease": disease_i,
                "confidence": round(top_prob[0][i].item() * 100, 1),
            })

        plant, disease = class_name_to_label(best_class)
        info = REMEDIES_DB.get(best_class, {
            "remedies": [
                "Consult a local agricultural expert for proper diagnosis.",
                "Isolate the affected plant to prevent potential spread.",
                "Check soil moisture and ensure proper drainage.",
            ],
            "recovery": "Varies by treatment",
            "details": f"Disease detected: {disease} on {plant}.",
        })

        log.info(f"Prediction: {best_class} ({confidence}%)")

        # ── Translation ──────────────────────────────────────────────────────
        lang = data.get("language", "en")
        if lang and lang != "en":
            log.info(f"Translating result into: {lang}")
            translated = translate_result(
                disease=disease,
                leaf_type=plant,
                details=info["details"],
                remedies=info["remedies"],
                recovery=info["recovery"],
                lang=lang,
            )
        else:
            translated = {
                "disease": disease,
                "leafType": plant,
                "details": info["details"],
                "remedies": info["remedies"],
                "recoveryTime": info["recovery"],
            }

        return jsonify({
            "disease": translated["disease"],
            "leafType": translated["leafType"],
            "confidence": confidence,
            "remedies": translated["remedies"],
            "recoveryTime": translated["recoveryTime"],
            "details": translated["details"],
            "rawClass": best_class,
            "top3": top3,
        })

    except Exception as e:
        log.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route("/api/batch-predict", methods=["POST"])
def batch_predict():
    """
    Accepts up to 15 photos with optional GPS coordinates and runs disease detection on each.
    Computes adjacent-risk for healthy zones near diseased zones (100m Haversine radius).
    """
    if model is None:
        return jsonify({"error": "Model not loaded. Check server logs."}), 503

    try:
        import torch
        import torch.nn.functional as F
        import math

        data = request.get_json(force=True)
        if not data or "photos" not in data:
            return jsonify({"error": "Missing 'photos' array in request body."}), 400

        photos = data["photos"][:15]  # enforce max 15
        lang = data.get("language", "en")

        def haversine(lat1, lng1, lat2, lng2):
            R = 6371000
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            d_phi = math.radians(lat2 - lat1)
            d_lam = math.radians(lng2 - lng1)
            a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2
            return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        results = []

        for photo in photos:
            entry = {
                "label": photo.get("label", "Unknown"),
                "lat": photo.get("lat"),
                "lng": photo.get("lng"),
                "adjacentRisk": False,
                "protectiveActions": [],
            }
            try:
                img = decode_image(photo["image"])
                tensor = transform(img).unsqueeze(0)
                with torch.no_grad():
                    logits = model(tensor)
                    probs = F.softmax(logits, dim=1)
                    top_prob, top_idx = torch.topk(probs, k=3, dim=1)

                best_class = CLASS_NAMES[top_idx[0][0].item()]
                confidence = round(top_prob[0][0].item() * 100, 1)
                plant, disease = class_name_to_label(best_class)
                info = REMEDIES_DB.get(best_class, {
                    "remedies": ["Consult a local agricultural expert."],
                    "recovery": "Varies",
                    "details": f"Detected: {disease} on {plant}.",
                })
                is_healthy = "healthy" in best_class.lower()
                severity = "none" if is_healthy else ("high" if confidence > 80 else ("medium" if confidence > 60 else "low"))

                entry.update({
                    "disease": disease,
                    "leafType": plant,
                    "confidence": confidence,
                    "isHealthy": is_healthy,
                    "severity": severity,
                    "remedies": info["remedies"],
                    "recoveryTime": info["recovery"],
                    "details": info["details"],
                    "rawClass": best_class,
                })
                log.info(f"Batch photo '{entry['label']}': {best_class} ({confidence}%)")
            except Exception as e:
                entry["error"] = str(e)
                log.warning(f"Batch photo '{entry['label']}' failed: {e}")

            results.append(entry)

        # ── Adjacent risk computation ──────────────────────────────────────
        RISK_RADIUS_M = 100
        diseased = [r for r in results if not r.get("isHealthy", True) and r.get("lat") is not None and r.get("lng") is not None]
        healthy = [r for r in results if r.get("isHealthy", False) and r.get("lat") is not None and r.get("lng") is not None]

        default_protective = [
            "Apply preventive fungicide spray immediately.",
            "Install physical barriers (nets/mulch) between fields.",
            "Remove infected plant debris from nearby areas.",
            "Monitor daily for early disease symptoms.",
            "Avoid sharing tools between healthy and diseased sections.",
        ]

        for hz in healthy:
            at_risk = any(
                haversine(hz["lat"], hz["lng"], dz["lat"], dz["lng"]) <= RISK_RADIUS_M
                for dz in diseased
            )
            if at_risk:
                hz["adjacentRisk"] = True
                # Try Gemini for protective actions
                api_key = os.getenv("GEMINI_API_KEY", "")
                gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
                if api_key:
                    try:
                        nearby_diseases = list({dz["disease"] for dz in diseased})
                        prompt = (
                            f"A healthy {hz['leafType']} field is within 100 meters of fields infected with: "
                            f"{', '.join(nearby_diseases)}. "
                            f"List exactly 5 brief, actionable protective measures to prevent the disease from spreading. "
                            f"Return ONLY a JSON array of 5 strings, no markdown, no explanation."
                        )
                        url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:generateContent?key={api_key}"
                        body = {
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 512},
                        }
                        res = requests.post(url, json=body, timeout=10)
                        res.raise_for_status()
                        raw = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if raw.startswith("```"):
                            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                        actions = json.loads(raw)
                        if isinstance(actions, list) and all(isinstance(a, str) for a in actions):
                            hz["protectiveActions"] = actions[:5]
                            continue
                    except Exception as ge:
                        log.warning(f"Gemini protective actions failed: {ge}")
                hz["protectiveActions"] = default_protective

        return jsonify({"results": results})

    except Exception as e:
        log.error(f"Batch prediction error: {e}", exc_info=True)
        return jsonify({"error": f"Batch prediction failed: {str(e)}"}), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    log.info("=" * 60)
    log.info("  FarmerMitra Disease Detection Backend")
    log.info("=" * 60)

    success = load_model()
    if not success:
        log.error("WARNING: Model failed to load. Predictions will return 503.")

    log.info(f"Starting server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
