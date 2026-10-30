import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { CalendarIcon, UsersIcon, CheckCircleIcon } from '../common/Icons';
import { formatDate } from '../../utils/helpers';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const isOwner = project.role === 'Owner';
  const isAdmin = project.role === 'Admin' || isOwner;

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
      onClick={handleCardClick}
    >
      {/* Top Header: Title and Role Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', letterSpacing: -0.2 }}>
          {project.name}
        </h3>
        <Badge type="role" value={project.role || 'Member'} />
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', minHeight: 38, lineHeight: 1.4 }}>
        {project.description || 'No description provided.'}
      </p>

      {/* Progress */}
      <div>
        <ProgressBar
          percentage={project.progress_percentage || 0}
          showLabel
        />
      </div>

      {/* Card Footer: Metadata and Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-dim)',
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Team members">
            <UsersIcon size={14} />
            {project.member_count || 1}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Completed tasks">
            <CheckCircleIcon size={14} />
            {project.completed_tasks || 0}/{project.total_tasks || 0}
          </span>
          {project.deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Deadline">
              <CalendarIcon size={14} />
              {formatDate(project.deadline)}
            </span>
          )}
        </div>

        {/* Quick action buttons (stop propagation to prevent navigating to workspace) */}
        {(isAdmin || isOwner) && (
          <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
            {isAdmin && onEdit && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEdit(project)}
                style={{ padding: '2px 6px' }}
              >
                Edit
              </button>
            )}
            {isOwner && onDelete && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onDelete(project)}
                style={{ padding: '2px 6px', color: 'var(--color-danger)' }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
