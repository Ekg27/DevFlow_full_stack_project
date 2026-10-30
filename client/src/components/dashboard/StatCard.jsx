import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'var(--brand-primary)',
}) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}
