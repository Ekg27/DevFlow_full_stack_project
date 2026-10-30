import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { PlusIcon } from '../common/Icons';

export default function KanbanColumn({
  title,
  status,
  tasks = [],
  onOpenTask,
  onStatusChange,
  onAddTask,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only reset if moving completely out of column
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = Number(taskIdStr);
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className="kanban-column-header">
        <div className="column-title-group">
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                status === 'Done'
                  ? 'var(--color-success)'
                  : status === 'In Progress'
                  ? 'var(--brand-primary)'
                  : 'var(--text-dim)',
            }}
          />
          <span>{title}</span>
          <span className="column-count-badge">{tasks.length}</span>
        </div>

        {onAddTask && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onAddTask(status)}
            title={`Add task to ${title}`}
            style={{ padding: '2px 6px' }}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </div>

      {/* Cards Drop Area */}
      <div
        className={`kanban-cards-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpenTask}
            onStatusChange={onStatusChange}
          />
        ))}

        {tasks.length === 0 && (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-dim)',
              fontStyle: 'italic',
            }}
          >
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  );
}
