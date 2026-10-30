import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost'
  size = 'md',        // 'sm' | 'md'
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon = null,
  ...rest
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="spinner spinner-sm" aria-hidden="true" />
      ) : (
        icon && <span className="btn-icon">{icon}</span>
      )}
      {children}
    </button>
  );
}
