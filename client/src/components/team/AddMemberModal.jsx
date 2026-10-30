import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

export default function AddMemberModal({
  isOpen,
  onClose,
  onAddMember,
  isSubmitting = false,
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    onAddMember({
      email: email.trim().toLowerCase(),
      role,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Invite an existing registered user to this project workspace by their email address.
        </p>

        <Input
          label="User Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="colleague@devflow.com"
          required
          error={error}
          autoFocus
        />

        <div className="form-group">
          <label className="form-label" htmlFor="member-role">
            Project Role
          </label>
          <select
            id="member-role"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Member">Member (can create, edit, move tasks, and comment)</option>
            <option value="Admin">Admin (can manage members and edit project details)</option>
          </select>
        </div>

        <div className="modal-footer" style={{ margin: '20px -24px -24px', paddingBottom: 16 }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
