import "../styles/health-card.css";

export default function HealthCard({ result }) {
  return (
    <div className="health-card glass">
      <div className="card-heading">
        <h3>Health Recommendation</h3>
        {result && <span className="chip" style={{ background: `${result.color}22`, color: result.color, borderColor: `${result.color}55` }}>{result.category}</span>}
      </div>

      {!result ? (
        <p className="placeholder">Run a prediction to see personalized health guidance.</p>
      ) : (
        <ul className="advice-list">
          {result.health_advice.map((line, i) => (
            <li key={i}>
              <span className="advice-dot" style={{ background: result.color }} />
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
