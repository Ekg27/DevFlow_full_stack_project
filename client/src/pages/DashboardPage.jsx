import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import StatCard from '../components/dashboard/StatCard';
import ProjectCard from '../components/projects/ProjectCard';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import {
  FolderIcon,
  ListTodoIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  CalendarIcon,
  ArrowRightIcon,
  ActivityIcon,
} from '../components/common/Icons';
import { formatDate, isOverdue } from '../utils/helpers';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboard();
        if (data.success) {
          setDashboardData(data);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [showToast]);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <Loader size="lg" message="Loading your workspace analytics..." />
      </AppLayout>
    );
  }

  const stats = dashboardData?.stats || {};
  const myTasks = dashboardData?.my_tasks || [];
  const recentProjects = dashboardData?.recent_projects || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <AppLayout
      title="Dashboard"
      actions={
        <Link to="/projects" className="btn btn-primary btn-sm">
          View All Projects
        </Link>
      }
    >
      {/* Welcome Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Welcome back, {user?.name || 'Developer'}</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Here is what is happening across your projects and tasks today.
        </p>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Projects"
          value={stats.total_projects || 0}
          subtitle="Projects you belong to"
          icon={<FolderIcon size={20} />}
          color="var(--brand-primary)"
        />
        <StatCard
          title="Total Tasks"
          value={stats.total_tasks || 0}
          subtitle="Across your projects"
          icon={<ListTodoIcon size={20} />}
          color="var(--color-info)"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress_tasks || 0}
          subtitle="Actively being worked on"
          icon={<ClockIcon size={20} />}
          color="var(--color-warning)"
        />
        <StatCard
          title="Completed"
          value={stats.completed_tasks || 0}
          subtitle="Finished deliverables"
          icon={<CheckCircleIcon size={20} />}
          color="var(--color-success)"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdue_tasks || 0}
          subtitle="Requires attention"
          icon={<AlertCircleIcon size={20} />}
          color="var(--color-danger)"
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.overall_progress_percentage || 0}%`}
          subtitle="Overall project progress"
          icon={<TrendingUpIcon size={20} />}
          color="var(--color-success)"
        />
      </div>

      {/* Split Columns: Assigned Tasks & Recent Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Tasks Assigned to Current User */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
              Assigned to Me ({myTasks.length})
            </h2>
          </div>

          {myTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              No tasks currently assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myTasks.map((task) => {
                const overdue = isOverdue(task.due_date, task.status);
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/projects/${task.project_id}?taskId=${task.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {task.project_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <Badge type="priority" value={task.priority} />
                      <Badge type="status" value={task.status} />
                      {task.due_date && (
                        <span
                          style={{
                            fontSize: 11,
                            color: overdue ? 'var(--color-danger)' : 'var(--text-dim)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <CalendarIcon size={12} />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
              Recent Projects
            </h2>
            <Link to="/projects" className="btn btn-ghost btn-sm" style={{ padding: '2px 8px' }}>
              All Projects <ArrowRightIcon size={12} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create a project to start organizing tasks."
              actionLabel="Create Project"
              onAction={() => navigate('/projects')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Recent Activity across user's projects */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ActivityIcon size={18} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
            Recent Activity Across Workspace
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No recent activity recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivity.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 13,
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-main)' }}>{act.user_name}</strong>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{act.action.toLowerCase()}:</span>{' '}
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>{act.details}</span>{' '}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>in {act.project_name}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
                  {formatDate(act.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
