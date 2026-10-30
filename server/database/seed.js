/**
 * Database Seed Script
 *
 * Populates the database with demo data for development.
 * Run with: npm run seed
 *
 * Creates users, projects, memberships, tasks, comments,
 * and activity log entries so the app has realistic data
 * to display right away.
 */

const path = require('path');

// Load env variables before anything else
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcrypt');
const db = require('../config/db');
const { initDatabase } = require('./init');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Ensure all tables exist
  initDatabase();

  // 2. Clear existing data (order matters because of foreign keys)
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM comments;
    DELETE FROM tasks;
    DELETE FROM project_members;
    DELETE FROM projects;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  // ---------- USERS ----------
  const SALT_ROUNDS = 10;
  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  );

  const alice = insertUser.run('Alice Johnson', 'alice@devflow.com', passwordHash);
  const bob = insertUser.run('Bob Smith', 'bob@devflow.com', passwordHash);
  const charlie = insertUser.run('Charlie Davis', 'charlie@devflow.com', passwordHash);

  const aliceId = alice.lastInsertRowid;
  const bobId = bob.lastInsertRowid;
  const charlieId = charlie.lastInsertRowid;

  console.log(`👤 Created users: Alice (${aliceId}), Bob (${bobId}), Charlie (${charlieId})`);

  // ---------- PROJECTS ----------
  const insertProject = db.prepare(
    'INSERT INTO projects (name, description, start_date, deadline, created_by) VALUES (?, ?, ?, ?, ?)'
  );

  const project1 = insertProject.run(
    'DevFlow Platform',
    'A full-stack project management application with task tracking, team collaboration, and activity logging.',
    '2024-01-15',
    '2024-06-30',
    aliceId
  );

  const project2 = insertProject.run(
    'Mobile App Redesign',
    'Complete redesign of the mobile application with new UI/UX, improved performance, and offline support.',
    '2024-02-01',
    '2024-05-15',
    bobId
  );

  const proj1Id = project1.lastInsertRowid;
  const proj2Id = project2.lastInsertRowid;

  console.log(`📁 Created projects: DevFlow Platform (${proj1Id}), Mobile App Redesign (${proj2Id})`);

  // ---------- PROJECT MEMBERS ----------
  const insertMember = db.prepare(
    'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)'
  );

  // DevFlow Platform: Alice = Owner, Bob = Admin, Charlie = Member
  insertMember.run(proj1Id, aliceId, 'Owner');
  insertMember.run(proj1Id, bobId, 'Admin');
  insertMember.run(proj1Id, charlieId, 'Member');

  // Mobile App Redesign: Bob = Owner, Alice = Member, Charlie = Admin
  insertMember.run(proj2Id, bobId, 'Owner');
  insertMember.run(proj2Id, aliceId, 'Member');
  insertMember.run(proj2Id, charlieId, 'Admin');

  console.log('👥 Added members to both projects');

  // ---------- TASKS ----------
  const insertTask = db.prepare(`
    INSERT INTO tasks (project_id, title, description, priority, status, assigned_to, created_by, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // DevFlow Platform tasks (project 1)
  const t1 = insertTask.run(proj1Id, 'Set up project structure', 'Initialize the monorepo with frontend and backend folders, configure linting and formatting.', 'High', 'Done', aliceId, aliceId, '2024-02-01');
  const t2 = insertTask.run(proj1Id, 'Design database schema', 'Create ERD and define all tables for users, projects, tasks, comments, and activity logs.', 'High', 'Done', bobId, aliceId, '2024-02-10');
  const t3 = insertTask.run(proj1Id, 'Implement authentication', 'Build login/register endpoints with JWT tokens and password hashing.', 'High', 'In Progress', aliceId, aliceId, '2024-03-01');
  const t4 = insertTask.run(proj1Id, 'Build task management API', 'CRUD endpoints for tasks with filtering, sorting, and pagination support.', 'Medium', 'In Progress', bobId, aliceId, '2024-03-15');
  const t5 = insertTask.run(proj1Id, 'Create dashboard UI', 'Design and implement the main dashboard with project stats and recent activity.', 'Medium', 'To Do', charlieId, bobId, '2024-04-01');
  const t6 = insertTask.run(proj1Id, 'Write API documentation', 'Document all REST endpoints using Swagger/OpenAPI specification.', 'Low', 'To Do', null, aliceId, '2024-05-01');

  // Mobile App Redesign tasks (project 2)
  const t7 = insertTask.run(proj2Id, 'User research & wireframes', 'Conduct user interviews and create low-fidelity wireframes for the new design.', 'High', 'Done', charlieId, bobId, '2024-02-15');
  const t8 = insertTask.run(proj2Id, 'Design system setup', 'Create a component library with colors, typography, spacing, and reusable components.', 'High', 'In Progress', charlieId, bobId, '2024-03-01');
  const t9 = insertTask.run(proj2Id, 'Implement offline storage', 'Add local database sync with conflict resolution for offline-first experience.', 'Medium', 'To Do', aliceId, bobId, '2024-04-01');
  const t10 = insertTask.run(proj2Id, 'Performance optimization', 'Profile and optimize rendering, reduce bundle size, implement lazy loading.', 'Low', 'To Do', bobId, bobId, '2024-04-15');

  console.log('📋 Created 10 tasks across both projects');

  // ---------- COMMENTS ----------
  const insertComment = db.prepare(
    'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)'
  );

  // Comments on tasks using dynamic IDs
  insertComment.run(t1.lastInsertRowid, bobId, 'Great job setting this up! The folder structure looks clean.');
  insertComment.run(t2.lastInsertRowid, aliceId, "I've added the ERD diagram to the docs folder. Please review.");
  insertComment.run(t2.lastInsertRowid, charlieId, 'Looks good! Should we add an index on the tasks.assigned_to column?');
  insertComment.run(t3.lastInsertRowid, bobId, 'Make sure to use bcrypt with at least 10 salt rounds for password hashing.');
  insertComment.run(t3.lastInsertRowid, aliceId, 'Done. Also added rate limiting on the login endpoint.');
  insertComment.run(t4.lastInsertRowid, aliceId, 'Should we support cursor-based pagination or offset-based?');
  insertComment.run(t7.lastInsertRowid, bobId, 'The wireframes have been approved by the stakeholders. Moving to high-fidelity.');
  insertComment.run(t8.lastInsertRowid, aliceId, 'Can we use Tailwind CSS for the design system? It would speed things up.');

  console.log('💬 Added 8 comments');

  // ---------- ACTIVITY LOGS ----------
  const insertActivity = db.prepare(
    'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)'
  );

  // DevFlow Platform activities
  insertActivity.run(proj1Id, aliceId, 'Created project', 'Project "DevFlow Platform" was created');
  insertActivity.run(proj1Id, aliceId, 'Added member', 'Bob Smith was added as Admin');
  insertActivity.run(proj1Id, aliceId, 'Added member', 'Charlie Davis was added as Member');
  insertActivity.run(proj1Id, aliceId, 'Created task', 'Task "Set up project structure" was created');
  insertActivity.run(proj1Id, aliceId, 'Updated task status', 'Task "Set up project structure" moved to Done');
  insertActivity.run(proj1Id, bobId, 'Created task', 'Task "Design database schema" was created');
  insertActivity.run(proj1Id, bobId, 'Updated task status', 'Task "Design database schema" moved to Done');
  insertActivity.run(proj1Id, aliceId, 'Created task', 'Task "Implement authentication" was created');
  insertActivity.run(proj1Id, bobId, 'Added comment', 'Commented on "Implement authentication"');

  // Mobile App Redesign activities
  insertActivity.run(proj2Id, bobId, 'Created project', 'Project "Mobile App Redesign" was created');
  insertActivity.run(proj2Id, bobId, 'Added member', 'Alice Johnson was added as Member');
  insertActivity.run(proj2Id, bobId, 'Added member', 'Charlie Davis was added as Admin');
  insertActivity.run(proj2Id, charlieId, 'Updated task status', 'Task "User research & wireframes" moved to Done');
  insertActivity.run(proj2Id, charlieId, 'Created task', 'Task "Design system setup" was created');

  console.log('📝 Added 14 activity log entries');

  // ---------- DONE ----------
  console.log('\n✅ Database seeded successfully!\n');
  console.log('='.repeat(50));
  console.log('  Demo Credentials');
  console.log('='.repeat(50));
  console.log('  Alice Johnson  | alice@devflow.com   | password123');
  console.log('  Bob Smith      | bob@devflow.com     | password123');
  console.log('  Charlie Davis  | charlie@devflow.com | password123');
  console.log('='.repeat(50));
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
