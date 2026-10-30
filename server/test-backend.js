/**
 * Comprehensive Backend API Test Suite
 *
 * Runs end-to-end tests against all DevFlow REST API routes
 * to verify complete functionality and authorization rules.
 */

const http = require('http');
const app = require('./app');

let server;
let baseUrl;

// Test helpers using native fetch (Node 18+)
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const config = {
    ...options,
    headers,
  };
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Starting DevFlow Backend Test Suite');
  console.log('========================================\n');

  // Start temporary server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running on port ${port}\n`);
      resolve();
    });
  });

  try {
    // 1. Health check
    console.log('--- 1. Health Endpoint ---');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns 200 ok');

    // 2. Authentication: Login demo user
    console.log('\n--- 2. Auth: Login ---');
    const aliceLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alice@devflow.com', password: 'password123' },
    });
    assert(aliceLogin.status === 200 && aliceLogin.data.token, 'Login Alice returns 200 with JWT token');
    const aliceToken = aliceLogin.data.token;
    const aliceAuth = { Authorization: `Bearer ${aliceToken}` };

    const invalidLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'alice@devflow.com', password: 'wrongpassword' },
    });
    assert(invalidLogin.status === 401, 'Login with wrong password returns 401');

    // 3. Authentication: Registration
    console.log('\n--- 3. Auth: Registration ---');
    const uniqueEmail = `testuser_${Date.now()}@devflow.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Test User', email: uniqueEmail, password: 'password123' },
    });
    assert(regRes.status === 201 && regRes.data.user.email === uniqueEmail, 'Register new user returns 201');
    const testUserToken = regRes.data.token;
    const testUserAuth = { Authorization: `Bearer ${testUserToken}` };

    // Duplicate registration check
    const dupReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Duplicate User', email: uniqueEmail, password: 'password123' },
    });
    assert(dupReg.status === 409, 'Duplicate email registration returns 409 Conflict');

    // 4. Authentication: Profile
    console.log('\n--- 4. Auth: Profile ---');
    const profile = await request('/api/auth/me', { headers: aliceAuth });
    assert(profile.status === 200 && profile.data.user.email === 'alice@devflow.com', 'GET /api/auth/me returns profile');

    const unauthProfile = await request('/api/auth/me');
    assert(unauthProfile.status === 401, 'GET /api/auth/me without token returns 401');

    // 5. Projects: Get all projects
    console.log('\n--- 5. Projects: Listing & Detail ---');
    const projList = await request('/api/projects', { headers: aliceAuth });
    assert(projList.status === 200 && Array.isArray(projList.data.projects), 'GET /api/projects returns projects list');
    assert(projList.data.projects.length >= 2, 'Alice belongs to at least 2 seeded projects');

    const projDetail = await request('/api/projects/1', { headers: aliceAuth });
    assert(projDetail.status === 200 && projDetail.data.project.id === 1, 'GET /api/projects/1 returns project detail');
    assert(projDetail.data.project.user_role === 'Owner', 'Alice is identified as Owner of project 1');

    // 6. Projects: Create new project
    console.log('\n--- 6. Projects: Creation & Updates ---');
    const createProj = await request('/api/projects', {
      method: 'POST',
      headers: testUserAuth,
      body: {
        name: 'Automated Test Project',
        description: 'Created during integration test',
        start_date: '2024-03-01',
        deadline: '2024-06-01',
      },
    });
    assert(createProj.status === 201 && createProj.data.project.name === 'Automated Test Project', 'POST /api/projects creates project');
    const newProjId = createProj.data.project.id;

    // Update project
    const updateProj = await request(`/api/projects/${newProjId}`, {
      method: 'PUT',
      headers: testUserAuth,
      body: { name: 'Updated Test Project', description: 'Updated desc' },
    });
    assert(updateProj.status === 200 && updateProj.data.project.name === 'Updated Test Project', 'PUT /api/projects/:id updates project');

    // 7. Team Members: Listing and Adding
    console.log('\n--- 7. Team Members Management ---');
    const membersBefore = await request(`/api/projects/${newProjId}/members`, { headers: testUserAuth });
    assert(membersBefore.status === 200 && membersBefore.data.members.length === 1, 'Project creator is initial sole member (Owner)');

    // Add Bob to this new project
    const addMemberRes = await request(`/api/projects/${newProjId}/members`, {
      method: 'POST',
      headers: testUserAuth,
      body: { email: 'bob@devflow.com', role: 'Admin' },
    });
    assert(addMemberRes.status === 201 && addMemberRes.data.member.role === 'Admin', 'POST /api/projects/:id/members adds Bob as Admin');

    // Duplicate member check
    const dupMember = await request(`/api/projects/${newProjId}/members`, {
      method: 'POST',
      headers: testUserAuth,
      body: { email: 'bob@devflow.com' },
    });
    assert(dupMember.status === 409, 'Adding duplicate member returns 409');

    // 8. Tasks: Create, Read, Update, Status Change
    console.log('\n--- 8. Task Management & Kanban Flow ---');
    const createTaskRes = await request(`/api/projects/${newProjId}/tasks`, {
      method: 'POST',
      headers: testUserAuth,
      body: {
        title: 'Complete backend unit tests',
        description: 'Ensure 100% route coverage',
        priority: 'High',
        status: 'To Do',
        assigned_to: 2, // Bob
        due_date: '2024-04-15',
      },
    });
    assert(createTaskRes.status === 201 && createTaskRes.data.task.title === 'Complete backend unit tests', 'POST /api/projects/:id/tasks creates task');
    const newTaskId = createTaskRes.data.task.id;

    // Reject task assignment to non-member
    const invalidAssign = await request(`/api/projects/${newProjId}/tasks`, {
      method: 'POST',
      headers: testUserAuth,
      body: {
        title: 'Task with invalid assignee',
        assigned_to: 99999, // Non-existent user
      },
    });
    assert(invalidAssign.status === 400, 'Assigning task to non-member returns 400');

    // Get task by ID
    const getTaskRes = await request(`/api/tasks/${newTaskId}`, { headers: testUserAuth });
    assert(getTaskRes.status === 200 && getTaskRes.data.task.id === newTaskId, 'GET /api/tasks/:id retrieves task');

    // Update task status (Kanban movement from To Do -> In Progress)
    const updateTaskStatus = await request(`/api/tasks/${newTaskId}`, {
      method: 'PUT',
      headers: testUserAuth,
      body: { status: 'In Progress' },
    });
    assert(updateTaskStatus.status === 200 && updateTaskStatus.data.task.status === 'In Progress', 'PUT /api/tasks/:id moves status to In Progress');

    // 9. Comments: Add, View, Edit, Delete
    console.log('\n--- 9. Comments & Collaboration ---');
    const addCommentRes = await request(`/api/tasks/${newTaskId}/comments`, {
      method: 'POST',
      headers: testUserAuth,
      body: { content: 'Initial comment from test user' },
    });
    assert(addCommentRes.status === 201 && addCommentRes.data.comment.content === 'Initial comment from test user', 'POST /api/tasks/:id/comments adds comment');
    const commentId = addCommentRes.data.comment.id;

    const getCommentsRes = await request(`/api/tasks/${newTaskId}/comments`, { headers: testUserAuth });
    assert(getCommentsRes.status === 200 && getCommentsRes.data.comments.length === 1, 'GET /api/tasks/:id/comments returns task comments');

    // Edit comment
    const editCommentRes = await request(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: testUserAuth,
      body: { content: 'Updated comment text' },
    });
    assert(editCommentRes.status === 200 && editCommentRes.data.comment.content === 'Updated comment text', 'PUT /api/comments/:id updates comment');

    // Unauthorized edit by another user
    const bobLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'bob@devflow.com', password: 'password123' },
    });
    const bobAuth = { Authorization: `Bearer ${bobLogin.data.token}` };

    const unauthEdit = await request(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: bobAuth,
      body: { content: 'Bob trying to edit Test User comment' },
    });
    assert(unauthEdit.status === 403, 'User cannot edit someone else comment (403)');

    // Delete comment
    const delCommentRes = await request(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: testUserAuth,
    });
    assert(delCommentRes.status === 200, 'DELETE /api/comments/:id removes comment');

    // 10. Dashboard Analytics
    console.log('\n--- 10. Dashboard Analytics Calculation ---');
    const dashRes = await request('/api/dashboard', { headers: aliceAuth });
    assert(dashRes.status === 200 && dashRes.data.stats, 'GET /api/dashboard returns stats object');
    assert(dashRes.data.stats.total_projects >= 2, 'Dashboard reflects actual database project count');
    assert(dashRes.data.stats.total_tasks >= 10, 'Dashboard reflects actual database task count');
    assert(typeof dashRes.data.stats.overall_progress_percentage === 'number', 'Dashboard calculates overall completion percentage');

    // 11. Activity History
    console.log('\n--- 11. Activity History ---');
    const actRes = await request('/api/projects/1/activity', { headers: aliceAuth });
    assert(actRes.status === 200 && Array.isArray(actRes.data.activities), 'GET /api/projects/:id/activity returns activities array');
    assert(actRes.data.activities.length > 0, 'Project 1 has activity history records');

    // 12. Security & Authorization checks
    console.log('\n--- 12. Security & Boundary Checks ---');
    // Charlie is not a member of newProjId
    const charlieLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'charlie@devflow.com', password: 'password123' },
    });
    const charlieAuth = { Authorization: `Bearer ${charlieLogin.data.token}` };

    const forbiddenProj = await request(`/api/projects/${newProjId}`, { headers: charlieAuth });
    assert(forbiddenProj.status === 403, 'Non-member cannot access private project (403)');

    const forbiddenTasks = await request(`/api/projects/${newProjId}/tasks`, { headers: charlieAuth });
    assert(forbiddenTasks.status === 403, 'Non-member cannot view tasks of private project (403)');

    // 13. Clean up: Delete task & project
    console.log('\n--- 13. Resource Deletion Flow ---');
    const delTask = await request(`/api/tasks/${newTaskId}`, {
      method: 'DELETE',
      headers: testUserAuth,
    });
    assert(delTask.status === 200, 'DELETE /api/tasks/:id deletes task');

    const delProj = await request(`/api/projects/${newProjId}`, {
      method: 'DELETE',
      headers: testUserAuth,
    });
    assert(delProj.status === 200, 'DELETE /api/projects/:id deletes project (Owner only)');

  } catch (err) {
    console.error('Unhandled test runner error:', err);
    testsFailed++;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    console.log('\n========================================');
    console.log(`🏁 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('========================================\n');
    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runTests();
