import React from 'react';

export const AnalyticsChart = ({ data = [], labels = [], color = '#10b981', title = 'Earnings Over Time', type = 'area' }) => {
  const maxVal = Math.max(...data, 100);
  const chartHeight = 140;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  // Calculate coordinates
  const points = data.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (data.length - 1 || 1);
    // Invert Y axis for SVG (0 is top)
    const y = chartHeight - paddingY - (val / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, val };
  });

  // Generate SVG path for area/line chart
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--neutral-white)',
        border: '1px solid var(--neutral-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
    >
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', fontWeight: 500 }}>
          Total: ₹{data.reduce((a, b) => a + b, 0).toLocaleString()}
        </span>
      </h3>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="var(--neutral-border)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="var(--neutral-border)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="var(--neutral-border)" strokeWidth="1" />

          {/* Grid Labels (Y-Axis) */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fontSize="8" fill="var(--neutral-muted)" fontWeight="600">
            ₹{Math.round(maxVal)}
          </text>
          <text x={paddingX - 8} y={chartHeight / 2 + 3} textAnchor="end" fontSize="8" fill="var(--neutral-muted)" fontWeight="600">
            ₹{Math.round(maxVal / 2)}
          </text>
          <text x={paddingX - 8} y={chartHeight - paddingY + 3} textAnchor="end" fontSize="8" fill="var(--neutral-muted)" fontWeight="600">
            ₹0
          </text>

          {type === 'area' ? (
            <>
              {/* Fill Area */}
              {points.length > 1 && (
                <path
                  d={areaPath}
                  fill={`url(#areaGrad-${title.replace(/\s+/g, '')})`}
                  opacity="0.15"
                />
              )}

              {/* Stroke Line */}
              {points.length > 1 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Tooltips */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="var(--neutral-white)"
                    stroke={color}
                    strokeWidth="2"
                    style={{ transition: 'var(--transition-all)', cursor: 'pointer' }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill={color}
                    opacity="0"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.target.previousSibling.setAttribute('r', '6');
                      e.target.previousSibling.setAttribute('fill', color);
                    }}
                    onMouseLeave={(e) => {
                      e.target.previousSibling.setAttribute('r', '4');
                      e.target.previousSibling.setAttribute('fill', 'var(--neutral-white)');
                    }}
                  />
                </g>
              ))}
            </>
          ) : (
            // Bar Chart
            points.map((p, idx) => {
              const barWidth = Math.min(25, (chartWidth - paddingX * 2) / data.length - 12);
              const barHeight = chartHeight - paddingY - p.y;
              return (
                <g key={idx}>
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx="3"
                    fill={color}
                    opacity="0.85"
                    style={{ transition: 'var(--transition-all)', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.target.setAttribute('opacity', '1')}
                    onMouseLeave={(e) => e.target.setAttribute('opacity', '0.85')}
                  />
                  <text
                    x={p.x}
                    y={Math.max(p.y - 4, 10)}
                    textAnchor="middle"
                    fontSize="7"
                    fill="var(--neutral-text)"
                    fontWeight="700"
                  >
                    ₹{p.val}
                  </text>
                </g>
              );
            })
          )}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={chartHeight - paddingY + 12}
              textAnchor="middle"
              fontSize="8"
              fill="var(--neutral-muted)"
              fontWeight="600"
            >
              {labels[idx]}
            </text>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id={`areaGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
