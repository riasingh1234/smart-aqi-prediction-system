"""
train_model.py
---------------
EDA + training pipeline for the Smart AQI Prediction system.

Steps:
1. Load data/aqi_dataset.csv
2. Quick EDA (saved as PNGs in outputs/)
3. Train/test split + scaling
4. Train Random Forest, Gradient Boosting, and (if installed) XGBoost
5. Compare MAE / MSE / RMSE / R2
6. Save the best model + scaler + feature importance to backend/

Run from the notebooks/ folder:
    python train_model.py
"""

import json
import warnings

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

DATA_PATH = "../data/aqi_dataset.csv"
BACKEND_DIR = "../backend"
OUTPUTS_DIR = "../outputs"

FEATURES = ["temperature", "humidity", "wind_speed", "pm25", "pm10", "no2", "so2", "co", "o3"]
TARGET = "aqi"

# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows")
print(df[FEATURES + [TARGET]].describe())

# ---------------------------------------------------------------------------
# 2. Quick EDA plots
# ---------------------------------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))
axes[0].hist(df[TARGET], bins=40, color="#2dd4bf")
axes[0].set_title("AQI Distribution")
axes[0].set_xlabel("AQI")

corr = df[FEATURES + [TARGET]].corr()[TARGET].drop(TARGET).sort_values()
axes[1].barh(corr.index, corr.values, color="#38bdf8")
axes[1].set_title("Feature Correlation with AQI")
plt.tight_layout()
plt.savefig(f"{OUTPUTS_DIR}/eda_overview.png", dpi=130)
plt.close()
print("Saved outputs/eda_overview.png")

# ---------------------------------------------------------------------------
# 3. Train/test split + scaling
# ---------------------------------------------------------------------------
X = df[FEATURES]
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# ---------------------------------------------------------------------------
# 4. Train candidate models
# ---------------------------------------------------------------------------
models = {
    "RandomForest": RandomForestRegressor(
        n_estimators=150, max_depth=10, min_samples_leaf=3, random_state=42, n_jobs=-1
    ),
    "GradientBoosting": GradientBoostingRegressor(n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42),
}

try:
    from xgboost import XGBRegressor
    models["XGBoost"] = XGBRegressor(
        n_estimators=350, max_depth=5, learning_rate=0.05,
        subsample=0.9, colsample_bytree=0.9, random_state=42, n_jobs=-1
    )
except ImportError:
    print("xgboost not installed — skipping (optional model)")

results = {}
trained = {}

for name, model in models.items():
    model.fit(X_train_s, y_train)
    preds = model.predict(X_test_s)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, preds)
    results[name] = {"MAE": mae, "MSE": mse, "RMSE": rmse, "R2": r2}
    trained[name] = model
    print(f"{name:>18}  MAE={mae:6.2f}  RMSE={rmse:6.2f}  R2={r2:.4f}")

# ---------------------------------------------------------------------------
# 5. Pick best model by R2
# ---------------------------------------------------------------------------
best_name = max(results, key=lambda k: results[k]["R2"])
best_model = trained[best_name]
print(f"\nBest model: {best_name}  ({results[best_name]})")

# ---------------------------------------------------------------------------
# 6. Feature importance plot for the winning model
# ---------------------------------------------------------------------------
if hasattr(best_model, "feature_importances_"):
    importances = pd.Series(best_model.feature_importances_, index=FEATURES).sort_values()
    plt.figure(figsize=(7, 5))
    plt.barh(importances.index, importances.values, color="#a78bfa")
    plt.title(f"Feature Importance — {best_name}")
    plt.tight_layout()
    plt.savefig(f"{OUTPUTS_DIR}/feature_importance.png", dpi=130)
    plt.close()
    print("Saved outputs/feature_importance.png")
    feature_importance = importances.sort_values(ascending=False).round(4).to_dict()
else:
    feature_importance = {}

# ---------------------------------------------------------------------------
# 7. Persist model, scaler, metadata for the Flask backend
# ---------------------------------------------------------------------------
joblib.dump(best_model, f"{BACKEND_DIR}/model.pkl")
joblib.dump(scaler, f"{BACKEND_DIR}/scaler.pkl")

metadata = {
    "best_model": best_name,
    "features": FEATURES,
    "metrics": {k: {m: round(v, 4) for m, v in v_.items()} for k, v_ in results.items()},
    "feature_importance": feature_importance,
}
with open(f"{BACKEND_DIR}/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("\nSaved backend/model.pkl, backend/scaler.pkl, backend/model_metadata.json")
