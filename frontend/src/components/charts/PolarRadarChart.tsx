import React, { useState } from 'react';

interface PolarRadarChartProps {
  primaryData: Record<string, number>;
  secondaryData?: Record<string, number>;
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  size?: number;
}

export const PolarRadarChart: React.FC<PolarRadarChartProps> = ({
  primaryData = {},
  secondaryData,
  title,
  primaryColor = '#D99738', // default golden amber
  secondaryColor = '#70B814', // default lime
  primaryLabel = 'Predicted Profile',
  secondaryLabel = 'Comparison Profile',
  size = 360,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    descriptor: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const safePrimary = primaryData || {};
  const keys = Object.keys(safePrimary);
  const n = keys.length;
  if (n === 0)
    return <div className="text-stone-500 text-xs p-4 font-mono">No sensory dimensions available</div>;

  const center = size / 2;
  const radius = center - 52;

  const getCoordinates = (index: number, value: number) => {
    const angle = ((Math.PI * 2) / n) * index - Math.PI / 2;
    const r = Math.max(0, Math.min(1.0, value)) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate polygon points
  const primaryPoints = keys
    .map((k, i) => {
      const { x, y } = getCoordinates(i, safePrimary[k] || 0);
      return `${x},${y}`;
    })
    .join(' ');

  const secondaryPoints = secondaryData
    ? keys
        .map((k, i) => {
          const { x, y } = getCoordinates(i, secondaryData[k] || 0);
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <div className="relative flex flex-col items-center select-none">
      {title && (
        <h4 className="text-xs font-bold text-stone-300 mb-2 tracking-wider uppercase font-sans">
          {title}
        </h4>
      )}

      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric circles */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const r = level * radius;
          return (
            <g key={level}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray={level < 1.0 ? '3 3' : 'none'}
              />
              <text
                x={center + 4}
                y={center - r + 9}
                fontSize="8.5"
                fill="#6B7280"
                fontFamily="monospace"
                className="select-none font-medium"
              >
                {level * 100}%
              </text>
            </g>
          );
        })}

        {/* Spoke lines & labels */}
        {keys.map((k, i) => {
          const angle = ((Math.PI * 2) / n) * i - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          const labelX = center + (radius + 24) * Math.cos(angle);
          const labelY = center + (radius + 24) * Math.sin(angle);

          const formattedKey = k.replace(/_/g, ' ');

          return (
            <g key={k}>
              <line x1={center} y1={center} x2={x2} y2={y2} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.2" />
              <text
                x={labelX}
                y={labelY}
                fontSize="9.5"
                fontWeight="600"
                fill="#D1D5DB"
                textAnchor="middle"
                dominantBaseline="middle"
                className="capitalize tracking-tight hover:fill-amber-400 transition-colors cursor-default select-none font-sans"
              >
                {formattedKey}
              </text>
            </g>
          );
        })}

        {/* Secondary polygon (e.g. Initial/Before) */}
        {secondaryPoints && (
          <polygon
            points={secondaryPoints}
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-all duration-300"
          />
        )}

        {/* Primary polygon (e.g. Modified/Target/Predicted) */}
        <polygon
          points={primaryPoints}
          fill={primaryColor}
          fillOpacity="0.26"
          stroke={primaryColor}
          strokeWidth="2.5"
          className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(217,151,56,0.3)]"
        />

        {/* Primary vertices */}
        {keys.map((k, i) => {
          const { x, y } = getCoordinates(i, safePrimary[k] || 0);
          const val = safePrimary[k] || 0;
          return (
            <circle
              key={k}
              cx={x}
              cy={y}
              r={val > 0.05 ? '4' : '2'}
              fill={primaryColor}
              stroke="#161920"
              strokeWidth="2"
              className="cursor-pointer hover:r-5 transition-all shadow-sm"
              onMouseEnter={() => setHoveredPoint({ descriptor: k, value: val, x, y })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-20 pointer-events-none px-3 py-1.5 bg-[#161920]/95 backdrop-blur-md text-white text-[11px] rounded-xl shadow-2xl font-mono -translate-x-1/2 border border-white/20"
          style={{ top: hoveredPoint.y - 34, left: hoveredPoint.x }}
        >
          <span className="capitalize font-bold text-amber-400">
            {hoveredPoint.descriptor.replace(/_/g, ' ')}:
          </span>{' '}
          {(hoveredPoint.value * 100).toFixed(0)}%
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 text-xs font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: primaryColor }} />
          <span className="text-stone-300 font-medium">{primaryLabel}</span>
        </div>
        {secondaryData && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-dashed"
              style={{ borderColor: secondaryColor, backgroundColor: `${secondaryColor}33` }}
            />
            <span className="text-stone-400 font-medium">{secondaryLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
