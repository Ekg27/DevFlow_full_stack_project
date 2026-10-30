import React from 'react';

export default function Loader({ size = 'md', message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className={`spinner spinner-${size}`} />
      {message && <span>{message}</span>}
    </div>
  );
}
