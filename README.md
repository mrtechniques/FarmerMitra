# FarmerMitra - AI Plant Disease Detector

FarmerMitra is an advanced, AI-powered agricultural tool designed to help farmers instantly detect crop diseases and receive actionable, real-time remedies. Using a state-of-the-art Deep Learning model (ConvNeXt-Tiny with Spatial Attention) and integrated with Google's Gemini AI, FarmerMitra delivers high-accuracy diagnoses for Apple, Grape, and Tomato plants across 18 distinct disease classes.

## 1. Project Overview

### What is FarmerMitra?

FarmerMitra acts as a digital companion for farmers. By simply uploading a photo of a leaf, farmers receive an instant health assessment of the plant. If a disease is detected, it provides customized, dynamically generated remedies, recovery times, and prevention strategies.

### Features

- **Deep Learning Disease Detection**: Accurately classifies 18 health conditions across Apple, Grape, and Tomato crops.
- **Dynamic Remedies**: Uses Google Gemini AI to generate specific, actionable prevention and treatment strategies.
- **Multilingual Support**: Supports diagnosis translation into multiple regional languages (Hindi, Kannada, Malayalam, Tamil, Marathi, Telugu, Bengali).
- **Semantic Image Validation**: Rejects non-plant images or poorly focused photos using Gemini Vision.
- **Batch Prediction & Risk Assessment**: Analyzes up to 15 photos at once. Uses GPS coordinates to calculate a 100-meter adjacent-risk radius to warn healthy fields of nearby infections.
- **Modern Frontend**: A fully responsive, beautiful user interface built with React, Tailwind CSS, and Framer Motion.

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Python, Flask, PyTorch (ConvNeXt-Tiny + Custom Attention Engine), Requests
- **AI Integration**: Google Gemini API (`gemini-2.0-flash`)

---

## 2. Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) 3.10+
- Git

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/FarmerMitra.git
   cd FarmerMitra
   ```
2. Create an environment variables file. Copy `.env.example` to `.env` (in the project root/backend):
   ```bash
   cp .env.example .env
   ```
3. Add your Gemini API Key to the `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

### Installation Steps & Running Locally

**Terminal 1: Start the Backend (Flask API)**

```bash
# Navigate to the backend directory (if requirements exist there) or project root
cd backend
# Create a virtual environment
python -m venv venv
# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Run the Flask server
python app.py
```

_The backend server will run at `http://localhost:5000`._

**Terminal 2: Start the Frontend (React)**

```bash
# From the project root
npm install
npm run dev
```

_The frontend will compile and run, typically at `http://localhost:3000`._

---

## 3. Project Structure

```text
FarmerMitra/
├── backend/                    # Python Backend API
│   ├── models/                 # PyTorch weight files (*.pth)
│   ├── app.py                  # Main Flask API configuration & endpoints
│   └── requirements.txt        # Python dependency list
├── src/                        # Frontend source code
│   ├── components/             # Reusable UI components (Navbar, Cards, etc.)
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Main application pages
│   ├── utils/                  # Helper functions (Image processing, etc.)
│   ├── App.tsx                 # Core application layout and routing
│   ├── index.css               # Global Tailwind CSS entry
│   └── main.tsx                # React DOM entry point
├── package.json                # NPM dependency mapping and configurations
├── vite.config.ts              # Vite configuration
└── .env                        # Environment variables
```

### Key Files

- `backend/app.py`: Houses the Flask server, routing, the PyTorch model definitions, and the Gemini API integrations via `requests`.
- `src/App.tsx`: Manages the overall React provider tree, routing, and shared states.

---

## 4. API Documentation

The backend exposes a highly robust RESTful API over `http://localhost:5000/api`.

### Endpoints List

#### 1. `GET /api/health`

Checks the server and model loading status.

**Response (200 OK):**

```json
{
  "status": "ok",
  "model_loaded": true,
  "num_classes": 31,
  "classes": ["Apple Scab Leaf", "..."]
}
```

#### 2. `POST /api/predict`

Predicts a disease from a single image and generates localized remedies.

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,...",
  "language": "en"
}
```

_(Language supports: `en`, `hi`, `kn`, `ml`, `ta`, `mr`, `te`, `bn`)_

**Response (200 OK):**

```json
{
  "disease": "Early Blight",
  "leafType": "Tomato",
  "confidence": 98.4,
  "remedies": [
    "Apply fungicides containing chlorothalonil.",
    "Remove lower infected leaves."
  ],
  "recoveryTime": "2-3 weeks with treatment",
  "details": "Early blight is caused by Alternaria solani...",
  "rawClass": "Tomato___Early_blight",
  "top3": [
    {
      "class": "Tomato___Early_blight",
      "plant": "Tomato",
      "disease": "Early Blight",
      "confidence": 98.4
    }
  ]
}
```

#### 3. `POST /api/batch-predict`

Processes up to 15 images concurrently and assesses adjacent risk via Haversine distance computations.

**Request Body:**

```json
{
  "photos": [
    {
      "image": "data:image/jpeg;base64,...",
      "lat": 34.0522,
      "lng": -118.2437,
      "label": "Sector A"
    }
  ],
  "language": "en"
}
```

**Response (200 OK):**

```json
{
  "results": [
    {
      "label": "Sector A",
      "disease": "Healthy",
      "leafType": "Grape",
      "confidence": 99.1,
      "isHealthy": true,
      "severity": "none",
      "adjacentRisk": true,
      "protectiveActions": ["Apply preventive fungicide spray immediately."]
    }
  ]
}
```

### Error Codes

- **400 Bad Request:** Missing fields (e.g., no base64 string provided).
- **422 Unprocessable Entity:** The uploaded image failed the Gemini semantic validity check (e.g., solid color or not a plant).
- **500 Internal Server Error:** Server-side PyTorch or generation crash.
- **503 Service Unavailable:** ML model failed to load in memory.

---

## 5. Development

### Available Scripts

- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the React application for production.
- **`npm run lint`**: Runs TypeScript compilation checks.
- **`npm run preview`**: Serves the generated production build locally.

### Testing

_Frontend UI Testing and Backend Pytest configurations are planned for a future release._ Currently, manual testing can be executed directly via the local environment instances.

### Contributing Guidelines

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Adhere to TypeScript typing rules and Tailwind CSS norms.
4. Commit your changes (`git commit -m 'feat: Added an amazing feature'`).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a standard Pull Request (PR) against the `main` branch.

---

## 6. Deployment

### Production Build

**Frontend:**
Run `npm run build`. This generates a heavily optimized, minified `dist/` folder containing strictly static assets (HTML/CSS/JS).
**Backend:**
Ensure you are using a production WSGI server like `gunicorn` rather than the default Flask development server.

```bash
pip install gunicorn
gunicorn app:app --workers 4 --bind 0.0.0.0:5000
```

### Environment Variables

For production, ensure the following secure variables are populated on your respective hosting platforms:

- `GEMINI_API_KEY`: Strictly required for AI generation.
- `PORT`: Port for the API to run (used in the Flask setup).

### Hosting Platforms

- **Frontend Deployments**: Ideal for Vercel, Netlify, or AWS Amplify. (Ensure you add Vite rewrite constraints for client-side routing if required).
- **Backend Deployments**: Ideal for Render, Railway, AWS EC2, or DigitalOcean Droplets given the environment requires `torch` and substantial memory allocations.

---

## 7. Troubleshooting

### Common Issues

**1. `Model not loaded. Check server logs.` (Flask Error 503)**

- **Cause**: The `.pth` weight file is missing from `backend/models/`.
- **Solution**: Ensure `farmer-mitra_weights.pth` is explicitly downloaded and placed correctly in `backend/models/`.

**2. Port 5000 is currently in use**

- **Cause**: Another application (like macOS AirPlay receiver) is occupying Port 5000.
- **Solution**: Run `app.py` under a different `PORT` configuration via env variables. (`PORT=5001 python app.py`). Update `vite.config.ts` proxy to target the new port.

**3. `AI Validation Service is temporarily unavailable`**

- **Cause**: Invalid or expired `GEMINI_API_KEY`, or rate limiting.
- **Solution**: Check your Google Vertex / AI Studio dashboard. Ensure `.env` is populated properly and the backend has been restarted.

**4. OOM (Out of Memory) crash locally on Backend**

- **Cause**: `torch` is allocating too much memory for Batch Predictions.
- **Solution**: Decrease the upload footprint, or run the app on a machine containing >4GB RAM.

---

## 8. License & Contact

**License**
This project is proprietary or covered under the default MIT guidelines unless specifically stated otherwise in adjacent LICENSE files.

**Contact**
Maintained by the FarmerMitra Development Team. For inquiries, pull requests, or feature requests, consult the GitHub repository 'Issues' tab.
