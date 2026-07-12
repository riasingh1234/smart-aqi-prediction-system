# AeroIndex — Smart Air Quality Forecast & Health Advisory System

A full-stack machine learning web application that predicts the Air Quality Index (AQI)
from pollutant and weather readings, classifies the pollution level, explains which
pollutant is driving the score, and gives category-specific health advice — wrapped in a
glassmorphism dashboard.

**Live demo:** _add your deployed URL here after following the Deployment section_

---

## Overview

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, Recharts, Axios |
| Backend | Flask + Flask-CORS |
| ML | scikit-learn (Random Forest / Gradient Boosting) + optional XGBoost, Joblib |
| Data | Synthetic dataset generated from CPCB AQI sub-index breakpoints (`data/generate_data.py`) |

## Architecture

```
Browser (React dashboard)
      │  POST /predict  { temperature, humidity, wind_speed, pm25, pm10, no2, so2, co, o3 }
      ▼
Flask API (backend/app.py)
      │  scaler.transform → model.predict
      ▼
Trained model.pkl (Random Forest, chosen automatically by R² during training)
      │
      ▼
JSON response: { AQI, category, risk_level, color, health_advice,
                 main_pollutant, main_pollutant_reason, pollutant_breakdown }
```

## Project Structure

```
Smart-AQI-System/
├── frontend/           React + Vite dashboard
│   └── src/
│       ├── components/ AQIGauge, InputForm, KPICards, HealthCard,
│       │               PollutantAnalysis, TrendGraph, WeatherSummary,
│       │               Navbar, ParticulateField
│       └── styles/      per-component CSS + design tokens
├── backend/             Flask API + trained model.pkl / scaler.pkl
├── notebooks/           train_model.py (EDA + model comparison + training)
├── data/                generate_data.py + aqi_dataset.csv
├── outputs/              EDA plots, feature importance chart
├── requirements.txt
└── README.md
```

## Getting Started

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
python app.py
```

The API starts on `http://localhost:5000`.

- `GET /` → health check message
- `GET /health` → `{status, model}`
- `GET /metadata` → training metrics + feature importance
- `POST /predict` → AQI prediction (see payload below)

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # points the app at localhost:5000 by default
npm run dev
```

Open `http://localhost:5173`. If the backend isn't running, the dashboard
automatically falls back to a client-side heuristic estimate so the UI stays
fully interactive (useful for demoing without a server).

### 3. (Optional) Retrain the model

```bash
cd data && python generate_data.py       # regenerate the synthetic dataset
cd ../notebooks && python train_model.py  # retrain, compares RF / GB / XGBoost, saves the best
```

This overwrites `backend/model.pkl`, `backend/scaler.pkl`, and
`backend/model_metadata.json`, and refreshes the plots in `outputs/`.

## API Reference

**POST `/predict`**

Request body:

```json
{
  "temperature": 27, "humidity": 55, "wind_speed": 8,
  "pm25": 65, "pm10": 110, "no2": 32, "so2": 12, "co": 1.1, "o3": 38
}
```

Response:

```json
{
  "AQI": 176.4,
  "category": "Poor",
  "risk_level": "High",
  "color": "#e74c3c",
  "health_advice": ["Wear an N95 mask outdoors.", "Avoid outdoor workouts."],
  "main_pollutant": "PM2.5",
  "main_pollutant_reason": "Fine particulate matter small enough to penetrate deep into the lungs...",
  "pollutant_breakdown": { "PM2.5": {"value": 65, "unit": "µg/m³"}, "...": "..." },
  "model_used": "RandomForest"
}
```

## AQI Classification

| Range | Category | Color |
|---|---|---|
| 0–50 | Good | Green |
| 51–100 | Satisfactory | Yellow |
| 101–200 | Moderate | Orange |
| 201–300 | Poor | Red |
| 301–400 | Very Poor | Purple |
| 401–500 | Severe | Maroon |

## Model Performance

Trained on 6,000 synthetic samples generated from CPCB sub-index breakpoints
(see `data/generate_data.py`), 80/20 train-test split:

| Model | MAE | RMSE | R² |
|---|---|---|---|
| **Random Forest (selected)** | ~3.9 | ~5.5 | ~0.997 |
| Gradient Boosting | ~4.3 | ~5.9 | ~0.997 |
| XGBoost | ~4.8 | ~8.0 | ~0.994 |

PM2.5 is consistently the dominant feature by importance, matching real-world
AQI behavior in most urban environments.

> Note: this dataset is synthetic. Swap `data/aqi_dataset.csv` for a real
> CPCB/OpenAQ export and rerun `train_model.py` to retrain on real data — no
> other code changes required, since the feature schema stays identical.

## Deployment

**Backend → Render**
1. Push this repo to GitHub.
2. New Web Service on Render → point at `backend/`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`

**Frontend → Vercel**
1. Import the repo, set root directory to `frontend/`.
2. Add environment variable `VITE_API_URL` = your Render backend URL.
3. Deploy.

## Future Improvements

- Replace manual input with live OpenWeather / OpenAQ / WAQI API integration
  (the input schema already matches what those APIs return).
- City search + map-based pollution visualization.
- Prediction history stored per user.
- SHAP-based explainable AI for per-prediction feature attribution.
- Downloadable PDF prediction report.
- 7-day AQI forecast (currently the trend graph shows simulated history).

## License

MIT — free to use for academic, portfolio, or resume purposes.
