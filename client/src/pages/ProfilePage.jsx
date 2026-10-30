import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { formatDate } from '../utils/helpers';
import { UserIcon, MailIcon, CalendarIcon, LogOutIcon, CheckCircleIcon } from '../components/common/Icons';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboard();
        if (data.success && data.my_tasks) {
          setTasks(data.my_tasks);
        }
      } catch (err) {
        console.error('Failed to load user profile tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppLayout title="Profile & Account">
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* User Card */}
        <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar name={user?.name || 'User'} size="lg" />
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                {user?.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MailIcon size={14} />
                  {user?.email}
                </span>
                {user?.created_at && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarIcon size={14} />
                    Joined {formatDate(user.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button variant="danger" icon={<LogOutIcon size={14} />} onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {/* User Assigned Tasks */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 16 }}>
            My Assigned Tasks ({tasks.length})
          </h3>

          {loading ? (
            <Loader size="sm" message="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              You currently have no tasks assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/projects/${t.project_id}?taskId=${t.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      {t.title}
                    </h4>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      in {t.project_name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge type="priority" value={t.priority} />
                    <Badge type="status" value={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
