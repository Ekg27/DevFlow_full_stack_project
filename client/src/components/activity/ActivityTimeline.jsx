import React from 'react';
import {
  FolderIcon,
  CheckCircleIcon,
  MessageSquareIcon,
  UsersIcon,
  ActivityIcon,
  ListTodoIcon,
} from '../common/Icons';
import { timeAgo } from '../../utils/helpers';

export default function ActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
        No activity recorded yet for this project.
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'Created project':
      case 'Updated project':
        return <FolderIcon size={16} />;
      case 'Created task':
      case 'Updated task':
        return <ListTodoIcon size={16} />;
      case 'Updated task status':
        return <CheckCircleIcon size={16} />;
      case 'Added comment':
        return <MessageSquareIcon size={16} />;
      case 'Added member':
      case 'Removed member':
        return <UsersIcon size={16} />;
      default:
        return <ActivityIcon size={16} />;
    }
  };

  return (
    <div className="activity-timeline">
      {activities.map((act) => (
        <div key={act.id} className="activity-item">
          <div className="activity-icon-bubble">
            {getActionIcon(act.action)}
          </div>
          <div className="activity-content">
            <div className="activity-title">
              <strong style={{ color: 'var(--text-main)' }}>{act.user_name}</strong>{' '}
              <span style={{ color: 'var(--text-muted)' }}>{act.action.toLowerCase()}:</span>{' '}
              <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>{act.details}</span>
            </div>
            <span className="activity-time">{timeAgo(act.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
