import React from 'react';
import { FolderIcon } from './Icons';
import Button from './Button';

export default function EmptyState({
  icon = <FolderIcon size={24} />,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
