@echo off
echo ============================================================
echo   FarmerMitra Disease Detection Backend
echo ============================================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://python.python.org
    pause
    exit /b 1
)

REM Install dependencies if needed
echo [INFO] Checking and installing dependencies...
pip install -r requirements.txt --quiet

REM Check if model file exists
if not exist "models\trained_model_weights.pth" (
    echo [ERROR] Model file not found at: models\trained_model_weights.pth
    echo Please make sure the model file is in the correct location.
    pause
    exit /b 1
)

echo.
echo [INFO] Starting Flask server on http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.

python app.py

pause
