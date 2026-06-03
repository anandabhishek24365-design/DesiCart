import React, { useEffect, useState, useContext } from 'react';
import { Store, Home, Bike } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const MapMock = ({ status }) => {
  const { globalCoords, isGpsActive } = useContext(AppContext);
  const [positionIndex, setPositionIndex] = useState(0);

  // Animate the rider along the path if out for delivery
  useEffect(() => {
    let interval;
    if (status === 'out_for_delivery') {
      interval = setInterval(() => {
        setPositionIndex((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 150);
    } else if (status === 'delivered') {
      setPositionIndex(100);
    } else if (status === 'ready') {
      setPositionIndex(30); // Rider at store
    } else {
      setPositionIndex(0); // Rider waiting/not assigned
    }
    return () => clearInterval(interval);
  }, [status]);

  // Coordinates on a predefined curvy SVG path
  // Start: Store (50, 150), End: Home (350, 150)
  // Curve: M 50 150 C 120 40, 280 260, 350 150
  // Simplified path positions logic:
  const getCoordinates = (pct) => {
    // Basic bezier curve approximation
    const t = pct / 100;
    const x = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 200 + t * t * 350;
    const y = (1 - t) * (1 - t) * 150 + 2 * (1 - t) * t * 50 + t * t * 150;
    return { x, y };
  };

  const riderPos = getCoordinates(positionIndex);

  return (
    <div
      style={{
        width: '100%',
        background: 'var(--neutral-light)',
        border: '1px solid var(--neutral-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
        <span style={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Store size={14} /> Store
        </span>
        <span style={{ color: 'var(--accent-orange)' }}>
          {status === 'out_for_delivery' ? 'Rider is on the way!' : status === 'delivered' ? 'Arrived!' : 'Preparing order...'}
        </span>
        <span style={{ color: 'var(--neutral-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={14} /> You
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '180px', background: 'var(--neutral-white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px dashed var(--neutral-border)' }}>
        {/* Grid pattern mock */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--neutral-border) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            opacity: 0.5
          }}
        />

        <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
          {/* Curvy Road Path */}
          <path
            d="M 50 150 C 120 40, 280 260, 350 150"
            fill="none"
            stroke="var(--neutral-border)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 50 150 C 120 40, 280 260, 350 150"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Active travel progress highlighted in Green/Orange */}
          {positionIndex > 0 && (
            <path
              d={`M 50 150 C 120 40, 280 260, 350 150`}
              fill="none"
              stroke="var(--primary-green)"
              strokeWidth="4"
              strokeDasharray="300"
              strokeDashoffset={300 - (300 * positionIndex) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.15s ease' }}
            />
          )}

          {/* Decorative buildings/landmarks */}
          <circle cx="100" cy="220" r="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="280" cy="80" r="12" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="220" y="190" width="16" height="16" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

          {/* Store Pin (Start) */}
          <g transform="translate(50, 150)">
            <circle cx="0" cy="0" r="18" fill="var(--primary-green)" style={{ opacity: 0.15, animation: 'pulse-slow 2s infinite' }} />
            <circle cx="0" cy="0" r="10" fill="var(--primary-green)" />
            <circle cx="0" cy="0" r="4" fill="white" />
          </g>

          {/* Customer Pin (End) */}
          <g transform="translate(350, 150)">
            <circle cx="0" cy="0" r="18" fill="var(--accent-orange)" style={{ opacity: 0.15, animation: 'pulse-slow 2s infinite' }} />
            <circle cx="0" cy="0" r="10" fill="var(--accent-orange)" />
            <polygon points="-4,-4 4,-4 4,4 -4,4" fill="white" transform="rotate(45)" />
          </g>

          {/* Rider Marker */}
          {status !== 'pending' && status !== 'preparing' && (
            <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
              <circle cx="0" cy="-6" r="16" fill="var(--neutral-white)" stroke="var(--primary-green)" strokeWidth="2" style={{ boxShadow: 'var(--shadow-md)' }} />
              <g transform="translate(-8, -14) scale(0.65)">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  fill="var(--primary-green)"
                />
              </g>
            </g>
          )}
        </svg>

        {/* Live location badge */}
        {status !== 'pending' && status !== 'preparing' && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.25rem 0.75rem',
              backgroundColor: 'var(--neutral-white)',
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--primary-green)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Bike size={12} className="animate-pulse-slow" />
            <span>
              {isGpsActive && globalCoords
                ? `Rider Live GPS: ${globalCoords.lat.toFixed(5)}, ${globalCoords.lng.toFixed(5)}`
                : 'Rider Live Position GPS Mock'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
