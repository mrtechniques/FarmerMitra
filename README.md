# FarmerMitra - AI Plant Disease Detector

Detect diseases in **Tomato, Grape, and Apple** plants instantly using a trained deep learning model.

## Architecture

```
FarmerMitra/
├── backend/                    # Python Flask ML backend
│   ├── models/
│   │   └── trained_model_weights.pth  # Trained model (ConvNeXt-Tiny + Attention)
│   ├── app.py                  # Flask API server
│   ├── requirements.txt        # Python dependencies
│   ├── start_server.bat        # One-click startup script (Windows)
│   └── model_info.py           # Utility to inspect model checkpoint
├── src/                        # React + TypeScript frontend
└── ...
```

## Supported Plants & Diseases (18 classes)

| Plant   | Diseases |
|---------|----------|
| 🍎 Apple | Apple Scab, Black Rot, Cedar Apple Rust, Healthy |
| 🍇 Grape | Black Rot, Esca (Black Measles), Leaf Blight, Healthy |
| 🍅 Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, TYLCV, Mosaic Virus, Healthy |

## Setup & Running

### Step 1: Start the Python Backend

```bash
# Option A — double click:
backend\start_server.bat

# Option B — command line:
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs at **http://localhost:5000**.

### Step 2: Start the Frontend

```bash
npm install
npm run dev
```

The frontend runs at **http://localhost:3000**.

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Check if model is loaded |
| POST | `/api/predict` | Send `{ "image": "<base64>" }`, get disease prediction |

## Model Details

- **Architecture**: ConvNeXt-Tiny + Custom Spatial Attention Module
- **Input**: 224×224 RGB images (ImageNet normalization)
- **Output**: 18 disease classes
- **Training Data**: PlantVillage dataset (Apple/Grape/Tomato subset)
