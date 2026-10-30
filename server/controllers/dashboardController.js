/**
 * Dashboard Controller
 *
 * Computes aggregated statistics across the user's projects and tasks
 * using actual SQL queries.
 */

const db = require('../config/db');

/**
 * Get aggregated dashboard statistics
 * GET /api/dashboard
 */
function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Total projects the user is a member of
    const projectCountRow = db
      .prepare('SELECT COUNT(*) AS total_projects FROM project_members WHERE user_id = ?')
      .get(userId);
    const totalProjects = projectCountRow ? projectCountRow.total_projects : 0;

    // 2. Task statistics across all projects the user belongs to
    const taskStats = db
      .prepare(`
        SELECT 
          COUNT(*) AS total_tasks,
          COALESCE(SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END), 0) AS completed_tasks,
          COALESCE(SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END), 0) AS in_progress_tasks,
          COALESCE(SUM(CASE WHEN status = 'To Do' THEN 1 ELSE 0 END), 0) AS todo_tasks,
          COALESCE(SUM(CASE 
            WHEN due_date IS NOT NULL AND due_date < date('now') AND status != 'Done' 
            THEN 1 ELSE 0 
          END), 0) AS overdue_tasks
        FROM tasks
        WHERE project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      `)
      .get(userId);

    const totalTasks = taskStats.total_tasks || 0;
    const completedTasks = taskStats.completed_tasks || 0;
    const inProgressTasks = taskStats.in_progress_tasks || 0;
    const todoTasks = taskStats.todo_tasks || 0;
    const overdueTasks = taskStats.overdue_tasks || 0;

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. Breakdown by priority
    const priorityStats = db
      .prepare(`
        SELECT 
          COALESCE(SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END), 0) AS high,
          COALESCE(SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END), 0) AS medium,
          COALESCE(SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END), 0) AS low
        FROM tasks
        WHERE project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)
      `)
      .get(userId);

    // 4. Tasks assigned directly to the logged-in user
    const myTasks = db
      .prepare(`
        SELECT 
          t.id,
          t.title,
          t.priority,
          t.status,
          t.due_date,
          t.project_id,
          p.name AS project_name
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to = ?
        ORDER BY 
          CASE t.status WHEN 'In Progress' THEN 1 WHEN 'To Do' THEN 2 ELSE 3 END,
          t.due_date ASC
        LIMIT 6
      `)
      .all(userId);

    // 5. Recent projects with progress
    const recentProjects = db
      .prepare(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.start_date,
          p.deadline,
          pm.role,
          (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
          (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS total_tasks,
          (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') AS completed_tasks
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ?
        ORDER BY p.created_at DESC
        LIMIT 5
      `)
      .all(userId)
      .map((p) => ({
        ...p,
        progress_percentage: p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0,
      }));

    // 6. Recent activity across user's projects
    const recentActivity = db
      .prepare(`
        SELECT 
          al.id,
          al.project_id,
          al.action,
          al.details,
          al.created_at,
          u.name AS user_name,
          p.name AS project_name
        FROM activity_logs al
        JOIN users u ON al.user_id = u.id
        JOIN projects p ON al.project_id = p.id
        WHERE al.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)
        ORDER BY al.created_at DESC
        LIMIT 8
      `)
      .all(userId);

    return res.status(200).json({
      success: true,
      stats: {
        total_projects: totalProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        todo_tasks: todoTasks,
        overdue_tasks: overdueTasks,
        overall_progress_percentage: overallProgress,
        priority_breakdown: priorityStats,
      },
      my_tasks: myTasks,
      recent_projects: recentProjects,
      recent_activity: recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
};
