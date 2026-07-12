import { useEffect, useState } from "react";
import AQIGauge from "./components/AQIGauge";
import HealthCard from "./components/HealthCard";
import InputForm from "./components/InputForm";
import KPICards from "./components/KPICards";
import Navbar from "./components/Navbar";
import ParticulateField from "./components/ParticulateField";
import PollutantAnalysis from "./components/PollutantAnalysis";
import TrendGraph from "./components/TrendGraph";
import WeatherSummary from "./components/WeatherSummary";
import { predictAQI } from "./api";
import "./styles/layout.css";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function seedHistory() {
  // Simulated last-7-days trend so the graph has context before the first
  // live prediction. Once a prediction runs, it's appended as "Now".
  const base = 70;
  return DAY_LABELS.map((label, i) => ({
    label,
    aqi: Math.max(15, Math.round(base + Math.sin(i * 1.3) * 35 + (Math.random() - 0.5) * 20)),
  }));
}

// Fallback offline predictor mirrors backend/app.py's classification &
// advice logic, so the dashboard stays fully functional (per the brief's
// "manual input first, live API later" future-ready design) even if the
// Flask server isn't running yet.
function offlinePredict(payload) {
  const w = { pm25: 4.2, pm10: 1.1, no2: 0.9, so2: 0.6, co: 18, o3: 0.55 };
  let aqi =
    payload.pm25 * w.pm25 * 0.35 +
    payload.pm10 * w.pm10 * 0.3 +
    payload.no2 * w.no2 +
    payload.so2 * w.so2 +
    payload.co * w.co +
    payload.o3 * w.o3;
  aqi = Math.max(0, Math.min(500, aqi));

  const bands = [
    { max: 50, category: "Good", color: "#2ecc71", risk: "Low", advice: ["Air quality is satisfactory.", "Enjoy outdoor activities as usual."] },
    { max: 100, category: "Satisfactory", color: "#f1c40f", risk: "Low", advice: ["Air quality is acceptable.", "Unusually sensitive people should limit prolonged exertion."] },
    { max: 200, category: "Moderate", color: "#e67e22", risk: "Moderate", advice: ["Sensitive individuals should reduce prolonged outdoor exertion."] },
    { max: 300, category: "Poor", color: "#e74c3c", risk: "High", advice: ["Wear an N95 mask outdoors.", "Avoid outdoor workouts."] },
    { max: 400, category: "Very Poor", color: "#8e44ad", risk: "Very High", advice: ["Use an air purifier indoors.", "Limit outdoor exposure to short errands."] },
    { max: 10000, category: "Severe", color: "#6b1023", risk: "Severe", advice: ["Stay indoors.", "Avoid all unnecessary outdoor travel.", "Children and elderly should remain inside."] },
  ];
  const band = bands.find((b) => aqi <= b.max) || bands[bands.length - 1];

  const values = { pm25: payload.pm25, pm10: payload.pm10, no2: payload.no2, so2: payload.so2, co: payload.co, o3: payload.o3 };
  const weighted = {
    pm25: values.pm25 / 30, pm10: values.pm10 / 50, no2: values.no2 / 40,
    so2: values.so2 / 40, co: values.co / 1, o3: values.o3 / 50,
  };
  const dominantKey = Object.entries(weighted).sort((a, b) => b[1] - a[1])[0][0];
  const labels = { pm25: "PM2.5", pm10: "PM10", no2: "NO₂", so2: "SO₂", co: "CO", o3: "O₃" };
  const units = { pm25: "µg/m³", pm10: "µg/m³", no2: "µg/m³", so2: "µg/m³", co: "mg/m³", o3: "µg/m³" };
  const reasons = {
    pm25: "Fine particulate matter small enough to penetrate deep into the lungs and bloodstream.",
    pm10: "Coarse particulate matter that irritates airways and aggravates respiratory conditions.",
    no2: "Mostly from vehicle exhaust; irritates airways and contributes to smog formation.",
    so2: "From burning sulfur-containing fuels; can trigger bronchoconstriction.",
    co: "Reduces the blood's oxygen-carrying capacity.",
    o3: "Ground-level ozone formed by sunlight reacting with pollutants; peaks on hot days.",
  };

  return {
    AQI: Math.round(aqi * 10) / 10,
    category: band.category,
    risk_level: band.risk,
    color: band.color,
    health_advice: band.advice,
    main_pollutant: labels[dominantKey],
    main_pollutant_reason: reasons[dominantKey],
    pollutant_breakdown: Object.fromEntries(
      Object.keys(values).map((k) => [labels[k], { value: values[k], unit: units[k] }])
    ),
    model_used: "Offline heuristic (backend unreachable)",
  };
}

export default function App() {
  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastInputs, setLastInputs] = useState(null);
  const [history] = useState(seedHistory);

  useEffect(() => {
    // Ping the backend once on load to reflect connection status in the navbar.
    predictAQI({ temperature: 25, humidity: 50, wind_speed: 5, pm25: 20, pm10: 40, no2: 15, so2: 5, co: 0.5, o3: 20 })
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    setLastInputs(payload);
    try {
      const data = await predictAQI(payload);
      setResult(data);
      setStatus("online");
    } catch (err) {
      setStatus("offline");
      setResult(offlinePredict(payload));
      setError("Backend unreachable — showing an offline estimate. Start the Flask API for live model predictions.");
    } finally {
      setLoading(false);
    }
  };

  const severity = result ? Math.min(1, result.AQI / 400) : 0;

  return (
    <div className="app-shell">
      <ParticulateField severity={severity} />

      <div className="app-container">
        <Navbar status={status} />

        <section className="hero glass">
          <div className="hero-copy">
            <p className="hero-eyebrow">Live Decision Support</p>
            <h2>Know the air before you step outside</h2>
            <p className="hero-sub">
              Enter current pollutant and weather readings to get a predicted AQI, health guidance, and a
              breakdown of what's actually driving the number — powered by a Random Forest model trained on
              CPCB-standard AQI sub-index breakpoints.
            </p>
            {error && <p className="hero-warning">{error}</p>}
          </div>
          <AQIGauge aqi={result?.AQI ?? 0} category={result?.category ?? "Awaiting input"} color={result?.color ?? "#5eead4"} />
        </section>

        <KPICards result={result} />

        <div className="main-grid">
          <div className="col-left">
            <InputForm onSubmit={handleSubmit} loading={loading} />
          </div>

          <div className="col-right">
            {lastInputs && <WeatherSummary values={lastInputs} />}
            <TrendGraph history={history} current={result?.AQI} />
            <div className="split-row">
              <HealthCard result={result} />
              <PollutantAnalysis result={result} />
            </div>
          </div>
        </div>

        <footer className="app-footer">
          <span>AeroIndex — Smart AQI Forecast &amp; Health Advisory System</span>
          <span className="mono">{result ? `Model: ${result.model_used}` : "Model idle"}</span>
        </footer>
      </div>
    </div>
  );
}
