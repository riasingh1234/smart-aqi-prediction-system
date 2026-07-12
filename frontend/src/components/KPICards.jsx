import "../styles/kpi-cards.css";

export default function KPICards({ result }) {
  const items = [
    { label: "Current AQI", value: result ? Math.round(result.AQI) : "—", accent: result?.color },
    { label: "Category", value: result?.category || "—", accent: result?.color },
    { label: "Health Risk", value: result?.risk_level || "—", accent: result?.color },
    { label: "Main Pollutant", value: result?.main_pollutant || "—", accent: "var(--signal-cyan)" },
  ];

  return (
    <div className="kpi-row">
      {items.map((item) => (
        <div className="kpi-card glass" key={item.label}>
          <p className="kpi-label">{item.label}</p>
          <p className="kpi-value mono" style={{ color: item.accent || "var(--ink-primary)" }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
