import { useState } from "react";
import "../styles/input-form.css";

const FIELD_GROUPS = [
  {
    title: "Weather",
    fields: [
      { key: "temperature", label: "Temperature", unit: "°C", step: 0.1 },
      { key: "humidity", label: "Humidity", unit: "%", step: 0.1 },
      { key: "wind_speed", label: "Wind Speed", unit: "km/h", step: 0.1 },
    ],
  },
  {
    title: "Pollutants",
    fields: [
      { key: "pm25", label: "PM2.5", unit: "µg/m³", step: 0.1 },
      { key: "pm10", label: "PM10", unit: "µg/m³", step: 0.1 },
      { key: "no2", label: "NO₂", unit: "µg/m³", step: 0.1 },
      { key: "so2", label: "SO₂", unit: "µg/m³", step: 0.1 },
      { key: "co", label: "CO", unit: "mg/m³", step: 0.01 },
      { key: "o3", label: "O₃", unit: "µg/m³", step: 0.1 },
    ],
  },
];

const DEFAULTS = {
  temperature: 27, humidity: 55, wind_speed: 8,
  pm25: 65, pm10: 110, no2: 32, so2: 12, co: 1.1, o3: 38,
};

export default function InputForm({ onSubmit, loading }) {
  const [values, setValues] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});

  const handleChange = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
  };

  const validate = () => {
    const errs = {};
    Object.entries(values).forEach(([key, val]) => {
      if (val === "" || val === null || Number.isNaN(Number(val))) {
        errs[key] = "Required";
      } else if (Number(val) < 0) {
        errs[key] = "Must be ≥ 0";
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const numeric = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Number(v)]));
    onSubmit(numeric);
  };

  const loadSample = (kind) => {
    const samples = {
      clean: { temperature: 22, humidity: 48, wind_speed: 14, pm25: 12, pm10: 20, no2: 8, so2: 4, co: 0.4, o3: 30 },
      moderate: { temperature: 28, humidity: 58, wind_speed: 7, pm25: 75, pm10: 130, no2: 38, so2: 16, co: 1.3, o3: 45 },
      severe: { temperature: 12, humidity: 78, wind_speed: 2, pm25: 320, pm10: 420, no2: 95, so2: 55, co: 6.5, o3: 60 },
    };
    setValues(samples[kind]);
    setErrors({});
  };

  return (
    <form className="input-form glass" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Sensor Input</h2>
        <div className="sample-buttons">
          <button type="button" onClick={() => loadSample("clean")}>Clean</button>
          <button type="button" onClick={() => loadSample("moderate")}>Moderate</button>
          <button type="button" onClick={() => loadSample("severe")}>Severe</button>
        </div>
      </div>

      {FIELD_GROUPS.map((group) => (
        <div key={group.title} className="field-group">
          <p className="field-group-title">{group.title}</p>
          <div className="field-grid">
            {group.fields.map((f) => (
              <label key={f.key} className={`field ${errors[f.key] ? "field-error" : ""}`}>
                <span className="field-label">
                  {f.label} <span className="field-unit">{f.unit}</span>
                </span>
                <input
                  type="number"
                  step={f.step}
                  value={values[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                />
                {errors[f.key] && <span className="field-error-text">{errors[f.key]}</span>}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button type="submit" className="predict-btn" disabled={loading}>
        {loading ? <span className="btn-spinner" /> : "Predict AQI"}
      </button>
    </form>
  );
}
