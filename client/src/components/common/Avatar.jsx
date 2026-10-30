import React from 'react';
import { getInitials } from '../../utils/helpers';

export default function Avatar({
  name = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  title = '',
}) {
  const initials = getInitials(name);
  const sizeClass = `avatar-${size}`;

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      title={title || name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
