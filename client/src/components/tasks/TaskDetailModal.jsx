import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import CommentList from '../comments/CommentList';
import { CalendarIcon, UserIcon, EditIcon, TrashIcon, ClockIcon } from '../common/Icons';
import { formatDate, isOverdue } from '../../utils/helpers';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onCommentCountChange,
}) {
  if (!task) return null;

  const overdue = isOverdue(task.due_date, task.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      maxWidth={620}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Top Header Controls: Status selector + Edit/Delete buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>STATUS:</span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 12, fontWeight: 600 }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <Badge type="priority" value={task.priority} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<EditIcon size={14} />}
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon size={14} />}
              onClick={() => onDelete(task)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Task Title */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
          {task.title}
        </h2>

        {/* Description */}
        <div style={{ backgroundColor: 'var(--bg-app)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Description
          </span>
          <p style={{ fontSize: 13, color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {task.description || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No description provided.</span>}
          </p>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 12 }}>
          {/* Assignee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <UserIcon size={16} />
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: 11 }}>Assignee</span>
              {task.assignee_name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Avatar name={task.assignee_name} size="sm" />
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.assignee_name}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Unassigned</span>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <CalendarIcon size={16} />
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: 11 }}>Due Date</span>
              <span style={{ fontWeight: 600, color: overdue ? 'var(--color-danger)' : 'var(--text-main)', marginTop: 2, display: 'block' }}>
                {task.due_date ? formatDate(task.due_date) : 'No due date'}
                {overdue && ' (Overdue)'}
              </span>
            </div>
          </div>

          {/* Created by */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <ClockIcon size={16} />
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: 11 }}>Created</span>
              <span style={{ color: 'var(--text-main)', marginTop: 2, display: 'block' }}>
                {formatDate(task.created_at)} {task.creator_name ? `by ${task.creator_name}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Comments Section */}
        <CommentList
          taskId={task.id}
          onCommentCountChange={(newCount) => {
            if (onCommentCountChange) {
              onCommentCountChange(task.id, newCount);
            }
          }}
        />
      </div>
    </Modal>
  );
}
