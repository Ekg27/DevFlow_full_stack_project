import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
      showToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">DF</div>
          <h1 className="auth-title">Welcome to DevFlow</h1>
          <p className="auth-subtitle">Sign in to your project management workspace</p>
        </div>

        {isExpired && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid rgba(210, 153, 34, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-warning)',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            Your session has expired. Please log in again to continue.
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alice@devflow.com"
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            style={{ width: '100%', marginTop: 8 }}
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Credentials Quick Fill for College Demonstration */}
        <div
          style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
            Demo Accounts (1-Click Fill):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'space-between', padding: '4px 8px' }}
              onClick={() => handleDemoFill('alice@devflow.com')}
            >
              <span>Alice (Owner / Admin)</span>
              <span style={{ color: 'var(--brand-primary)' }}>alice@devflow.com</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'space-between', padding: '4px 8px' }}
              onClick={() => handleDemoFill('bob@devflow.com')}
            >
              <span>Bob (Admin / Owner)</span>
              <span style={{ color: 'var(--brand-primary)' }}>bob@devflow.com</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'space-between', padding: '4px 8px' }}
              onClick={() => handleDemoFill('charlie@devflow.com')}
            >
              <span>Charlie (Member / Admin)</span>
              <span style={{ color: 'var(--brand-primary)' }}>charlie@devflow.com</span>
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
