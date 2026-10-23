import React from 'react';

/**
 * High-performance, fully accessible CSS & SVG fallback for 3D scenes.
 * Automatically rendered when:
 * 1. WebGL is unsupported or disabled
 * 2. prefers-reduced-motion is active
 * 3. Screen width is mobile/tablet where GPU resources should be preserved
 */
export default function SceneFallback({ title = "Connected Collaboration Network" }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        background: 'radial-gradient(circle at 50% 50%, #111D2E 0%, #0B0F17 100%)',
        border: '1px solid var(--border-dark)',
      }}
      aria-label={title}
      role="img"
    >
      {/* Decorative SVG Geometric Node Graph */}
      <svg
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '85%', height: '85%', opacity: 0.85 }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Network Connector Lines */}
        <line x1="120" y1="120" x2="250" y2="180" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="250" y1="180" x2="380" y2="140" stroke="url(#lineGrad)" strokeWidth="2" />
        <line x1="250" y1="180" x2="210" y2="290" stroke="url(#lineGrad)" strokeWidth="2.5" />
        <line x1="120" y1="120" x2="210" y2="290" stroke="url(#lineGrad)" strokeWidth="1.5" />
        <line x1="380" y1="140" x2="360" y2="280" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="210" y1="290" x2="360" y2="280" stroke="url(#lineGrad)" strokeWidth="2" />

        {/* Orbit Rings */}
        <circle cx="250" cy="180" r="110" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="6 6" />
        <circle cx="250" cy="180" r="60" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />

        {/* Nodes (Students & Projects) */}
        <circle cx="250" cy="180" r="16" fill="url(#nodeGlow)" />
        <circle cx="250" cy="180" r="8" fill="#FFFFFF" />

        <circle cx="120" cy="120" r="10" fill="#10B981" />
        <circle cx="380" cy="140" r="12" fill="#3B82F6" />
        <circle cx="210" cy="290" r="11" fill="#10B981" />
        <circle cx="360" cy="280" r="9" fill="#F59E0B" />
      </svg>

      {/* Floating Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.875rem',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          color: '#A7F3D0',
          backdropFilter: 'blur(4px)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
        <span>CollabSphere Spatial Network</span>
      </div>
    </div>
  );
}
