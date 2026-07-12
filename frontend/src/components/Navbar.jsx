import "../styles/navbar.css";

export default function Navbar({ status }) {
  return (
    <header className="navbar glass">
      <div className="navbar-brand">
        <span className="navbar-mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="11" stroke="var(--signal-cyan)" strokeWidth="1.6" opacity="0.5" />
            <circle cx="13" cy="13" r="6.5" stroke="var(--signal-cyan)" strokeWidth="1.6" />
            <circle cx="13" cy="13" r="2" fill="var(--signal-cyan)" />
          </svg>
        </span>
        <div>
          <h1>AeroIndex</h1>
          <p>Smart Air Quality Forecast &amp; Health Advisory</p>
        </div>
      </div>

      <div className="navbar-status">
        <span className={`status-dot ${status}`} />
        <span className="status-label">
          {status === "online" ? "Model Online" : status === "loading" ? "Connecting…" : "Offline Mode"}
        </span>
      </div>
    </header>
  );
}
