import React, { useState, useEffect, useCallback, useRef } from 'react';
import CommentItem from './CommentItem';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { commentService } from '../../services/commentService';
import { useToast } from '../../context/ToastContext';
import { MessageSquareIcon } from '../common/Icons';

export default function CommentList({ taskId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Store the latest callbacks in refs so loadComments never needs them as
  // reactive dependencies, preventing the infinite re-fetch loop.
  const onCommentCountChangeRef = useRef(onCommentCountChange);
  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // loadComments only depends on taskId — it is stable across parent re-renders
  // that merely pass a new arrow-function reference for onCommentCountChange.
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getTaskComments(taskId);
      if (data.success) {
        setComments(data.comments || []);
        if (onCommentCountChangeRef.current) {
          onCommentCountChangeRef.current(data.comments.length);
        }
      }
    } catch (err) {
      showToastRef.current?.(err.response?.data?.message || 'Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId]); // ← only taskId; callbacks accessed via refs

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId, loadComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const data = await commentService.addComment(taskId, newComment.trim());
      if (data.success && data.comment) {
        const updated = [...comments, data.comment];
        setComments(updated);
        setNewComment('');
        showToastRef.current?.('Comment posted', 'success');
        if (onCommentCountChangeRef.current) {
          onCommentCountChangeRef.current(updated.length);
        }
      }
    } catch (err) {
      showToastRef.current?.(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      const data = await commentService.updateComment(commentId, content);
      if (data.success && data.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? data.comment : c))
        );
        showToastRef.current?.('Comment updated', 'success');
      }
    } catch (err) {
      showToastRef.current?.(err.response?.data?.message || 'Failed to update comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const data = await commentService.deleteComment(commentId);
      if (data.success) {
        const updated = comments.filter((c) => c.id !== commentId);
        setComments(updated);
        showToastRef.current?.('Comment deleted', 'success');
        if (onCommentCountChangeRef.current) {
          onCommentCountChangeRef.current(updated.length);
        }
      }
    } catch (err) {
      showToastRef.current?.(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="comments-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
        <MessageSquareIcon size={16} />
        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
          Comments ({comments.length})
        </h4>
      </div>

      {/* Add comment box */}
      <form onSubmit={handleAddComment}>
        <textarea
          className="form-textarea"
          rows={3}
          placeholder="Leave a comment or progress update..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!newComment.trim() || isSubmitting}
            loading={isSubmitting}
          >
            Comment
          </Button>
        </div>
      </form>

      {/* Existing comments */}
      {loading ? (
        <Loader size="sm" message="Loading comments..." />
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          No comments yet. Start the discussion!
        </div>
      ) : (
        <div style={{ display: 'flex', flex_direction: 'column', gap: 10 }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
