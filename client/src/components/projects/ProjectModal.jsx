import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setStartDate(initialData.start_date || '');
      setDeadline(initialData.deadline || '');
    } else {
      setName('');
      setDescription('');
      setStartDate('');
      setDeadline('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      start_date: startDate || null,
      deadline: deadline || null,
    });
  };

  const isEditing = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Mobile App Redesign"
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
          placeholder="What is this project about?"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ margin: '20px -24px -24px', paddingBottom: 16 }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
