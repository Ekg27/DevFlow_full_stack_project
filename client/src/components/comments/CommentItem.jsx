import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { timeAgo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { EditIcon, TrashIcon } from '../common/Icons';

export default function CommentItem({
  comment,
  onUpdate,
  onDelete,
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  const isAuthor = user && user.id === comment.user_id;

  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      setIsSaving(true);
      await onUpdate(comment.id, content.trim());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="comment-author-info">
          <Avatar name={comment.author_name} size="sm" />
          <span className="comment-author-name">{comment.author_name}</span>
          <span className="comment-timestamp">{timeAgo(comment.created_at)}</span>
          {comment.updated_at && comment.updated_at !== comment.created_at && (
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontStyle: 'italic' }}>
              (edited)
            </span>
          )}
        </div>

        {isAuthor && !isEditing && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(true)}
              title="Edit comment"
              style={{ padding: '2px 6px' }}
            >
              <EditIcon size={12} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onDelete(comment.id)}
              title="Delete comment"
              style={{ padding: '2px 6px', color: 'var(--color-danger)' }}
            >
              <TrashIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            className="form-textarea"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ fontSize: 13, marginBottom: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setContent(comment.content);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="comment-body">{comment.content}</div>
      )}
    </div>
  );
}
