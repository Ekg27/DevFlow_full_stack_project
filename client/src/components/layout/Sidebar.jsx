import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import {
  LayoutDashboardIcon,
  FolderIcon,
  UserIcon,
  LogOutIcon,
} from '../common/Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand / Logo */}
      <NavLink to="/" className="sidebar-brand">
        <div className="brand-icon-wrapper">DF</div>
        <span>DevFlow</span>
      </NavLink>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Workspace</div>
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <LayoutDashboardIcon size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FolderIcon size={16} />
          <span>Projects</span>
        </NavLink>

        <div className="nav-section-title">Account</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <UserIcon size={16} />
          <span>Profile</span>
        </NavLink>
      </nav>

      {/* User Footer with Quick Logout */}
      <div className="sidebar-footer">
        <div className="user-snippet">
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'Developer'}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
          style={{ padding: 4 }}
        >
          <LogOutIcon size={16} />
        </button>
      </div>
    </aside>
  );
}
