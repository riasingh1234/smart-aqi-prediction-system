import { useMemo } from "react";
import "../styles/particulate-field.css";

/**
 * Signature background element: slow-drifting dots representing suspended
 * particulate matter (PM2.5 / PM10), density and speed tied to the current
 * AQI severity — the worse the air, the busier and denser the drift.
 */
export default function ParticulateField({ severity = 0 }) {
  const count = 26 + Math.round(severity * 40); // 26 -> ~66 particles
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * (2.4 + severity * 2.2),
        duration: 18 + Math.random() * 22 - severity * 6,
        delay: Math.random() * -30,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count, severity]
  );

  return (
    <div className="particulate-field" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${Math.max(8, p.duration)}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
