import { motion } from 'framer-motion';

function polarPoint(angleDeg, radius, cx = 50, cy = 50) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function toPolygonPoints(items, maxR, cx, cy) {
  if (!items.length) return '';
  const step = 360 / items.length;
  return items
    .map((item, i) => {
      const val = Math.min(1, Math.max(0, (Number(item.value ?? item.score ?? 0)) / 100));
      const p = polarPoint(i * step, maxR * val, cx, cy);
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];

export default function CompetencyRadar({ competencies = [], size = 220, className = '' }) {
  const axes = competencies.slice(0, 6);
  if (axes.length < 3) {
    return (
      <div
        className={`flex items-center justify-center text-pink-300/50 text-sm ${className}`}
        style={{ width: size, height: size }}
      >
        Dados insuficientes
      </div>
    );
  }

  const cx = 50;
  const cy = 50;
  const maxR = 36;
  const step = 360 / axes.length;

  const dataPoints = toPolygonPoints(axes, maxR, cx, cy);
  const gridPolygons = GRID_LEVELS.map((level) => {
    const pts = axes.map((_, i) => {
      const p = polarPoint(i * step, maxR * level, cx, cy);
      return `${p.x},${p.y}`;
    });
    return pts.join(' ');
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Radar de competências"
    >
      {/* Background glow */}
      <defs>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(236,72,153,0.08)" />
          <stop offset="100%" stopColor="rgba(236,72,153,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={maxR + 2} fill="url(#radar-glow)" />

      {/* Grid polygons */}
      {gridPolygons.map((pts, idx) => (
        <polygon
          key={idx}
          points={pts}
          fill="none"
          stroke="rgba(244,114,182,0.12)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const outer = polarPoint(i * step, maxR, cx, cy);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(244,114,182,0.18)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        points={dataPoints}
        fill="rgba(236,72,153,0.22)"
        stroke="rgba(236,72,153,0.85)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'anticipate' }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Data points */}
      {axes.map((item, i) => {
        const val = Math.min(1, Math.max(0, (Number(item.value ?? item.score ?? 0)) / 100));
        const p = polarPoint(i * step, maxR * val, cx, cy);
        return (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.8"
            fill="#ec4899"
            initial={{ opacity: 0, r: 0 }}
            animate={{ opacity: 1, r: 1.8 }}
            transition={{ delay: 0.8 + i * 0.08, duration: 0.3 }}
          />
        );
      })}

      {/* Labels */}
      {axes.map((item, i) => {
        const labelPt = polarPoint(i * step, maxR + 10, cx, cy);
        const label = item.name || item.label || `C${i + 1}`;
        const shortLabel = label.length > 10 ? `${label.slice(0, 8)}…` : label;
        return (
          <text
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(251,207,232,0.8)"
            fontSize="4.2"
            fontWeight="600"
          >
            {shortLabel}
          </text>
        );
      })}
    </svg>
  );
}
