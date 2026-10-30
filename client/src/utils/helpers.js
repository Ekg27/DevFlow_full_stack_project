/**
 * Frontend Utility Helpers
 */

/**
 * Format a date string into readable format (e.g. "Mar 15, 2024")
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a timestamp into relative time (e.g. "5m ago", "2h ago", "3d ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    // If SQLite datetime is UTC or local, append Z if missing timezone
    let dateVal = dateStr;
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
      dateVal = dateStr.replace(' ', 'T') + 'Z';
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Extract 1-2 letter initials from a user's full name
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Check if a task is overdue given its deadline and status
 */
export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

/**
 * Truncate long text strings
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Color mapping for priority badges
 */
export function getPriorityStyles(priority) {
  switch (priority) {
    case 'High':
      return {
        bg: 'rgba(248, 81, 73, 0.15)',
        text: '#f85149',
        border: 'rgba(248, 81, 73, 0.3)',
      };
    case 'Medium':
      return {
        bg: 'rgba(210, 153, 34, 0.15)',
        text: '#d29922',
        border: 'rgba(210, 153, 34, 0.3)',
      };
    case 'Low':
      return {
        bg: 'rgba(63, 185, 80, 0.15)',
        text: '#3fb950',
        border: 'rgba(63, 185, 80, 0.3)',
      };
    default:
      return {
        bg: 'rgba(139, 148, 158, 0.15)',
        text: '#8b949e',
        border: 'rgba(139, 148, 158, 0.3)',
      };
  }
}

/**
 * Color mapping for status badges
 */
export function getStatusStyles(status) {
  switch (status) {
    case 'Done':
      return {
        bg: 'rgba(63, 185, 80, 0.15)',
        text: '#3fb950',
        border: 'rgba(63, 185, 80, 0.3)',
      };
    case 'In Progress':
      return {
        bg: 'rgba(88, 166, 255, 0.15)',
        text: '#58a6ff',
        border: 'rgba(88, 166, 255, 0.3)',
      };
    case 'To Do':
    default:
      return {
        bg: 'rgba(139, 148, 158, 0.15)',
        text: '#8b949e',
        border: 'rgba(139, 148, 158, 0.3)',
      };
  }
}

/**
 * Color mapping for role badges
 */
export function getRoleStyles(role) {
  switch (role) {
    case 'Owner':
      return {
        bg: 'rgba(163, 113, 247, 0.15)',
        text: '#bc8cff',
        border: 'rgba(163, 113, 247, 0.3)',
      };
    case 'Admin':
      return {
        bg: 'rgba(88, 166, 255, 0.15)',
        text: '#58a6ff',
        border: 'rgba(88, 166, 255, 0.3)',
      };
    case 'Member':
    default:
      return {
        bg: 'rgba(139, 148, 158, 0.15)',
        text: '#8b949e',
        border: 'rgba(139, 148, 158, 0.3)',
      };
  }
}
