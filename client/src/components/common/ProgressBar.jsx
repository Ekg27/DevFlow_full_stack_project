import React from 'react';

export default function ProgressBar({
  percentage = 0,
  showLabel = false,
  height = 6,
}) {
  const clamped = Math.min(Math.max(Math.round(percentage), 0), 100);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-container" style={{ height }}>
        <div
          className="progress-bar"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}
