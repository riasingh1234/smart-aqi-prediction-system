import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "../styles/trend-graph.css";

function buildSeries(history, current) {
  const points = [...history];
  if (current != null) points.push({ label: "Now", aqi: current });
  return points;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="trend-tooltip">
      <p className="mono">{label}</p>
      <p className="mono trend-tooltip-value">{Math.round(payload[0].value)} AQI</p>
    </div>
  );
}

export default function TrendGraph({ history, current }) {
  const data = buildSeries(history, current);

  return (
    <div className="trend-card glass">
      <div className="card-heading">
        <h3>AQI Trend (Last 7 Days)</h3>
        <span className="trend-hint">Predictions push a live point onto the trend</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5eead4" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--ink-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--ink-tertiary)" fontSize={11} tickLine={false} axisLine={false} width={34} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#5eead4"
            strokeWidth={2.4}
            fill="url(#aqiFill)"
            dot={{ r: 3, stroke: "#5eead4", strokeWidth: 1, fill: "#0b1526" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
