import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function TopBar({ title = 'DevFlow', actions = null }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {actions}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.name || 'User'} size="sm" />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
