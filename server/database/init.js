/**
 * Database Initialization
 *
 * Creates all tables and indexes needed by DevFlow.
 * Uses IF NOT EXISTS so it's safe to call on every server start.
 */

const db = require('../config/db');

function initDatabase() {
  // ----- Users table -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // ----- Projects table -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      start_date TEXT,
      deadline TEXT,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // ----- Project Members (junction table) -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'Member' CHECK(role IN ('Owner','Admin','Member')),
      joined_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, user_id)
    );
  `);

  // ----- Tasks table -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low','Medium','High')),
      status TEXT NOT NULL DEFAULT 'To Do' CHECK(status IN ('To Do','In Progress','Done')),
      assigned_to INTEGER,
      created_by INTEGER NOT NULL,
      due_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // ----- Comments table -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ----- Activity Logs table -----
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ----- Indexes for faster queries -----
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_project_members_project_user
      ON project_members(project_id, user_id);

    CREATE INDEX IF NOT EXISTS idx_tasks_project
      ON tasks(project_id);

    CREATE INDEX IF NOT EXISTS idx_tasks_assigned
      ON tasks(assigned_to);

    CREATE INDEX IF NOT EXISTS idx_comments_task
      ON comments(task_id);

    CREATE INDEX IF NOT EXISTS idx_activity_logs_project
      ON activity_logs(project_id);
  `);

  console.log('✅ Database tables and indexes initialized');
}

module.exports = { initDatabase };
