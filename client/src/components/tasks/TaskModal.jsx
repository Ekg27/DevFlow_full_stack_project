import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  initialStatus = 'To Do',
  members = [],
  isSubmitting = false,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'Medium');
      setStatus(initialData.status || 'To Do');
      setAssignedTo(initialData.assigned_to ? String(initialData.assigned_to) : '');
      setDueDate(initialData.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus(initialStatus || 'To Do');
      setAssignedTo('');
      setDueDate('');
    }
    setError('');
  }, [initialData, initialStatus, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assigned_to: assignedTo ? Number(assignedTo) : null,
      due_date: dueDate || null,
    });
  };

  const isEditing = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Implement user authentication flow"
          required
          error={error}
          autoFocus
        />

        <Input
          label="Description"
          textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide context or acceptance criteria..."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Priority */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Assignee */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">
              Assignee
            </label>
            <select
              id="task-assignee"
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '20px -24px -24px', paddingBottom: 16 }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
