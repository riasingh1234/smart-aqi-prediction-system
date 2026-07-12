"""
generate_data.py
-----------------
Generates a synthetic (but realistically-behaved) Air Quality dataset for
training the AQI regression model. Real pollutant + weather readings are
expensive/rate-limited to collect (OpenAQ / OpenWeather / WAQI all require
API keys), so this script builds a physically-plausible dataset using the
official CPCB sub-index breakpoints as the underlying generative logic.
This means the trained model reflects real AQI math, and can be swapped
for a live-API dataset later with zero changes to the training pipeline.

Run:
    python generate_data.py
Produces:
    data/aqi_dataset.csv
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 6000

# ---------------------------------------------------------------------------
# 1. Simulate weather (weather influences pollutant dispersion)
# ---------------------------------------------------------------------------
season = np.random.choice(["winter", "summer", "monsoon", "autumn"], size=N,
                           p=[0.3, 0.25, 0.2, 0.25])

temperature = np.where(season == "winter", np.random.normal(14, 4, N),
              np.where(season == "summer", np.random.normal(38, 4, N),
              np.where(season == "monsoon", np.random.normal(28, 3, N),
                        np.random.normal(24, 4, N))))

humidity = np.where(season == "monsoon", np.random.normal(80, 8, N),
           np.where(season == "winter", np.random.normal(65, 10, N),
                     np.random.normal(45, 12, N)))
humidity = np.clip(humidity, 10, 100)

wind_speed = np.where(season == "monsoon", np.random.normal(14, 4, N),
             np.where(season == "winter", np.random.normal(4, 2, N),
                       np.random.normal(8, 3, N)))
wind_speed = np.clip(wind_speed, 0.2, 30)

# ---------------------------------------------------------------------------
# 2. Simulate pollutants. Low wind + low temp (winter inversion) traps
#    pollutants -> higher PM levels. Rain (monsoon, high humidity) scrubs
#    the air -> lower PM levels.
# ---------------------------------------------------------------------------
dispersion = 1 / (0.3 + wind_speed / 6)          # low wind -> high factor
winter_boost = np.where(season == "winter", 1.6, 1.0)
monsoon_wash = np.where(season == "monsoon", 0.45, 1.0)

base_pm25 = np.random.gamma(shape=2.2, scale=28, size=N)
pm25 = np.clip(base_pm25 * dispersion * winter_boost * monsoon_wash, 3, 500)

pm10 = np.clip(pm25 * np.random.normal(1.6, 0.25, N) + np.random.normal(10, 8, N), 5, 600)

no2 = np.clip(np.random.gamma(2.0, 14, N) * dispersion * 0.6 + 5, 2, 260)
so2 = np.clip(np.random.gamma(1.6, 8, N) * dispersion * 0.5 + 2, 1, 180)
co = np.clip(np.random.gamma(2.0, 0.6, N) * dispersion * 0.4 + 0.2, 0.1, 30)
o3 = np.clip(np.random.normal(45, 25, N) + (temperature - 25) * 1.2, 2, 250)

# ---------------------------------------------------------------------------
# 3. Compute AQI using simplified CPCB/EPA-style piecewise-linear sub-index
#    breakpoints per pollutant, then take the max sub-index (dominant
#    pollutant rule used by real AQI calculations).
# ---------------------------------------------------------------------------
def sub_index(conc, breakpoints):
    """breakpoints: list of (c_lo, c_hi, i_lo, i_hi)"""
    conc = np.asarray(conc, dtype=float)
    idx = np.zeros_like(conc)
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        mask = (conc >= c_lo) & (conc <= c_hi)
        idx[mask] = ((i_hi - i_lo) / (c_hi - c_lo)) * (conc[mask] - c_lo) + i_lo
    idx[conc > breakpoints[-1][1]] = breakpoints[-1][3]
    return idx

PM25_BP = [(0,30,0,50),(31,60,51,100),(61,90,101,200),(91,120,201,300),(121,250,301,400),(251,500,401,500)]
PM10_BP = [(0,50,0,50),(51,100,51,100),(101,250,101,200),(251,350,201,300),(351,430,301,400),(431,600,401,500)]
NO2_BP  = [(0,40,0,50),(41,80,51,100),(81,180,101,200),(181,280,201,300),(281,400,301,400),(401,260,401,500)]
SO2_BP  = [(0,40,0,50),(41,80,51,100),(81,380,101,200),(381,800,201,300),(801,1600,301,400),(1601,180,401,500)]
CO_BP   = [(0,1,0,50),(1.1,2,51,100),(2.1,10,101,200),(10.1,17,201,300),(17.1,34,301,400),(34.1,30,401,500)]
O3_BP   = [(0,50,0,50),(51,100,51,100),(101,168,101,200),(169,208,201,300),(209,748,301,400),(749,250,401,500)]

i_pm25 = sub_index(pm25, PM25_BP)
i_pm10 = sub_index(pm10, PM10_BP)
i_no2  = sub_index(no2,  NO2_BP)
i_so2  = sub_index(so2,  SO2_BP)
i_co   = sub_index(co,   CO_BP)
i_o3   = sub_index(o3,   O3_BP)

sub_indices = np.vstack([i_pm25, i_pm10, i_no2, i_so2, i_co, i_o3])
pollutant_names = np.array(["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"])

aqi = sub_indices.max(axis=0)
dominant_idx = sub_indices.argmax(axis=0)
main_pollutant = pollutant_names[dominant_idx]

# small measurement noise so the model has to learn a real relationship
aqi = np.clip(aqi + np.random.normal(0, 4, N), 0, 500)

df = pd.DataFrame({
    "temperature": temperature.round(1),
    "humidity": humidity.round(1),
    "wind_speed": wind_speed.round(2),
    "pm25": pm25.round(1),
    "pm10": pm10.round(1),
    "no2": no2.round(1),
    "so2": so2.round(1),
    "co": co.round(2),
    "o3": o3.round(1),
    "main_pollutant": main_pollutant,
    "aqi": aqi.round(1),
})

df.to_csv("aqi_dataset.csv", index=False)
print(f"Saved {len(df)} rows to aqi_dataset.csv")
print(df.describe())
