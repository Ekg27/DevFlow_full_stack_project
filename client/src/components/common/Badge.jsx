import React from 'react';
import { getPriorityStyles, getStatusStyles, getRoleStyles } from '../../utils/helpers';

export default function Badge({
  type = 'status', // 'status' | 'priority' | 'role' | 'custom'
  value,
  label,
  customStyle = null,
  className = '',
}) {
  let styles = {};
  const text = label || value;

  if (customStyle) {
    styles = customStyle;
  } else if (type === 'priority') {
    styles = getPriorityStyles(value);
  } else if (type === 'status') {
    styles = getStatusStyles(value);
  } else if (type === 'role') {
    styles = getRoleStyles(value);
  }

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: styles.bg || 'var(--bg-elevated)',
        color: styles.text || 'var(--text-muted)',
        borderColor: styles.border || 'transparent',
      }}
    >
      {text}
    </span>
  );
}
