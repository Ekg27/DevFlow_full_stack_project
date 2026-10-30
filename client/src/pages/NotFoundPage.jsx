import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 12, marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, marginBottom: 24 }}>
        The page you are looking for doesn&apos;t exist, was removed, or you don&apos;t have access to it.
      </p>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
