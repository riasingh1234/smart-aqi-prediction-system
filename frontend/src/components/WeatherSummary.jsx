import "../styles/weather-summary.css";

const ICONS = {
  temperature: (
    <path d="M12 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v10" strokeWidth="1.6" strokeLinecap="round" />
  ),
  humidity: (
    <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  wind_speed: (
    <path d="M3 8h11a3 3 0 1 0-3-3M3 16h14a3 3 0 1 1-3 3M3 12h9" strokeWidth="1.6" strokeLinecap="round" />
  ),
};

export default function WeatherSummary({ values }) {
  const cards = [
    { key: "temperature", label: "Temperature", value: `${values.temperature}°C` },
    { key: "humidity", label: "Humidity", value: `${values.humidity}%` },
    { key: "wind_speed", label: "Wind Speed", value: `${values.wind_speed} km/h` },
  ];

  return (
    <div className="weather-row">
      {cards.map((c) => (
        <div className="weather-card glass" key={c.key}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--signal-cyan)">
            {ICONS[c.key]}
          </svg>
          <div>
            <p className="weather-label">{c.label}</p>
            <p className="weather-value mono">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
