import React, { useState } from 'react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { CalendarIcon, MessageSquareIcon, AlertCircleIcon } from '../common/Icons';
import { formatDate, isOverdue } from '../../utils/helpers';

export default function TaskCard({
  task,
  onOpen,
  onStatusChange,
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpen(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onOpen(task);
        }
      }}
    >
      {/* Top Header: Priority Badge & Inline Status Selector (for Accessibility) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <Badge type="priority" value={task.priority} />

        {/* Accessible status dropdown so keyboard users don't need drag-and-drop */}
        <select
          value={task.status}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(task.id, e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          className="form-select"
          style={{ width: 'auto', padding: '2px 6px', fontSize: 11, height: 22 }}
          aria-label="Change task status"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Title */}
      <h4 className="task-title">{task.title}</h4>

      {/* Task Footer: Assignee & Due Date / Comment count */}
      <div className="task-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.assignee_name ? (
            <Avatar name={task.assignee_name} size="sm" title={`Assigned to ${task.assignee_name}`} />
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Unassigned
            </span>
          )}

          {task.comment_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-dim)' }}>
              <MessageSquareIcon size={12} />
              {task.comment_count}
            </span>
          )}
        </div>

        {task.due_date && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: overdue ? 'var(--color-danger)' : 'var(--text-dim)',
              fontWeight: overdue ? 600 : 400,
            }}
            title={overdue ? 'Task is overdue!' : 'Due date'}
          >
            {overdue ? <AlertCircleIcon size={12} /> : <CalendarIcon size={12} />}
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
