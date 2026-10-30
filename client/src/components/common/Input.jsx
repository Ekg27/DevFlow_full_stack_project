import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  textarea = false,
  rows = 3,
  className = '',
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}

      {textarea ? (
        <textarea
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="form-textarea"
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="form-input"
          {...rest}
        />
      )}

      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
