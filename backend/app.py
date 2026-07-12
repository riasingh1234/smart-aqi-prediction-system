"""
Smart AQI Prediction API
-------------------------
Flask backend that loads the trained model + scaler and serves AQI
predictions along with category classification, health advice, and
dominant-pollutant analysis.

Run:
    pip install -r requirements.txt
    python app.py
Server starts on http://localhost:5000
"""

import json
import os

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Load trained artifacts
# ---------------------------------------------------------------------------
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

with open(os.path.join(BASE_DIR, "model_metadata.json")) as f:
    METADATA = json.load(f)

FEATURES = METADATA["features"]

# ---------------------------------------------------------------------------
# AQI classification breakpoints, colors, and health advice
# ---------------------------------------------------------------------------
AQI_CATEGORIES = [
    {"max": 50,  "category": "Good",        "color": "#2ecc71", "risk": "Low",
     "advice": ["Air quality is satisfactory.", "Enjoy outdoor activities as usual."]},
    {"max": 100, "category": "Satisfactory", "color": "#f1c40f", "risk": "Low",
     "advice": ["Air quality is acceptable.", "Unusually sensitive people should consider limiting prolonged exertion outdoors."]},
    {"max": 200, "category": "Moderate",     "color": "#e67e22", "risk": "Moderate",
     "advice": ["Sensitive individuals should reduce prolonged outdoor exertion.", "Keep an eye on symptoms if you have asthma or heart conditions."]},
    {"max": 300, "category": "Poor",         "color": "#e74c3c", "risk": "High",
     "advice": ["Wear an N95 mask outdoors.", "Avoid outdoor workouts.", "Keep windows closed during peak hours."]},
    {"max": 400, "category": "Very Poor",    "color": "#8e44ad", "risk": "Very High",
     "advice": ["Use an air purifier indoors.", "Limit outdoor exposure to short errands only.", "Sensitive groups should stay indoors."]},
    {"max": 10_000, "category": "Severe",    "color": "#6b1023", "risk": "Severe",
     "advice": ["Stay indoors.", "Avoid all unnecessary outdoor travel.", "Children and elderly should remain inside.", "Use N95 masks even for brief outdoor exposure."]},
]

# Why each pollutant matters, shown in the Pollutant Analysis card
POLLUTANT_INFO = {
    "pm25": {"label": "PM2.5", "unit": "µg/m³",
             "why": "Fine particulate matter small enough to penetrate deep into the lungs and bloodstream, the single strongest driver of AQI in most urban readings."},
    "pm10": {"label": "PM10", "unit": "µg/m³",
             "why": "Coarse particulate matter (dust, pollen, construction debris) that irritates airways and aggravates respiratory conditions."},
    "no2":  {"label": "NO₂",  "unit": "µg/m³",
             "why": "Mostly from vehicle exhaust and combustion; irritates airways and contributes to smog formation."},
    "so2":  {"label": "SO₂",  "unit": "µg/m³",
             "why": "Released by burning fossil fuels containing sulfur; can trigger bronchoconstriction, especially in asthmatics."},
    "co":   {"label": "CO",   "unit": "mg/m³",
             "why": "Reduces the blood's oxygen-carrying capacity; dangerous at high concentrations, especially in enclosed spaces."},
    "o3":   {"label": "O₃",   "unit": "µg/m³",
             "why": "Ground-level ozone formed by sunlight reacting with pollutants; peaks on hot days and irritates the respiratory system."},
}


def classify_aqi(aqi: float) -> dict:
    for band in AQI_CATEGORIES:
        if aqi <= band["max"]:
            return band
    return AQI_CATEGORIES[-1]


def dominant_pollutant(payload: dict) -> str:
    """Very rough sub-index proxy per pollutant, just to rank contribution
    for the UI's 'main pollutant' card (the trained model already learned
    the true nonlinear relationship for the AQI number itself)."""
    weights = {
        "pm25": payload["pm25"] / 30,
        "pm10": payload["pm10"] / 50,
        "no2":  payload["no2"] / 40,
        "so2":  payload["so2"] / 40,
        "co":   payload["co"] / 1.0,
        "o3":   payload["o3"] / 50,
    }
    return max(weights, key=weights.get)


@app.route("/")
def index():
    return jsonify(message="Smart AQI Prediction API Running")


@app.route("/health")
def health():
    return jsonify(status="ok", model=METADATA["best_model"])


@app.route("/metadata")
def metadata():
    return jsonify(METADATA)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if not data:
        return jsonify(error="Missing or invalid JSON body"), 400

    missing = [f for f in FEATURES if f not in data]
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

    try:
        values = [float(data[f]) for f in FEATURES]
    except (TypeError, ValueError):
        return jsonify(error="All input fields must be numeric"), 400

    X = np.array(values).reshape(1, -1)
    X_scaled = scaler.transform(X)
    aqi_pred = float(model.predict(X_scaled)[0])
    aqi_pred = round(max(0, min(500, aqi_pred)), 1)

    band = classify_aqi(aqi_pred)
    main_poll_key = dominant_pollutant(data)
    main_poll = POLLUTANT_INFO[main_poll_key]

    response = {
        "AQI": aqi_pred,
        "category": band["category"],
        "risk_level": band["risk"],
        "color": band["color"],
        "health_advice": band["advice"],
        "main_pollutant": main_poll["label"],
        "main_pollutant_reason": main_poll["why"],
        "pollutant_breakdown": {
            POLLUTANT_INFO[k]["label"]: {"value": data[k], "unit": POLLUTANT_INFO[k]["unit"]}
            for k in ["pm25", "pm10", "no2", "so2", "co", "o3"]
        },
        "model_used": METADATA["best_model"],
    }
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
