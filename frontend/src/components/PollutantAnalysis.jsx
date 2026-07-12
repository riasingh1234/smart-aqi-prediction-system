import "../styles/pollutant-analysis.css";

export default function PollutantAnalysis({ result }) {
  const breakdown = result?.pollutant_breakdown || {};
  const entries = Object.entries(breakdown);
  const maxVal = Math.max(1, ...entries.map(([, v]) => v.value));

  return (
    <div className="pollutant-card glass">
      <h3>Pollutant Analysis</h3>

      {!result ? (
        <p className="placeholder">Pollutant contribution will appear here after prediction.</p>
      ) : (
        <>
          <div className="dominant-block">
            <p className="dominant-label">Highest Contributing Pollutant</p>
            <p className="dominant-value mono">{result.main_pollutant}</p>
            <p className="dominant-reason">{result.main_pollutant_reason}</p>
          </div>

          <div className="bars">
            {entries.map(([name, { value, unit }]) => (
              <div className="bar-row" key={name}>
                <span className="bar-name">{name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(value / maxVal) * 100}%`,
                      background: name === result.main_pollutant ? result.color : "var(--signal-cyan)",
                    }}
                  />
                </div>
                <span className="bar-value mono">
                  {value} <span className="bar-unit">{unit}</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
