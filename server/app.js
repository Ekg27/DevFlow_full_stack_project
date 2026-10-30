/**
 * Express Application Configuration
 *
 * Configures global middleware, mounts all API route handlers,
 * provides health checks, and registers centralized error handling.
 */

const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const memberRoutes = require('./routes/memberRoutes');
const { taskRouter, projectTaskRouter } = require('./routes/taskRoutes');
const { commentRouter, taskCommentRouter } = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global middleware
app.use(cors({
  origin: true, // Allow requests from local frontend clients
  credentials: true,
}));

app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'DevFlow API Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/members', memberRoutes);
app.use('/api/projects/:projectId/tasks', projectTaskRouter);
app.use('/api/projects/:projectId/activity', activityRoutes);
app.use('/api/tasks', taskRouter);
app.use('/api/tasks/:taskId/comments', taskCommentRouter);
app.use('/api/comments', commentRouter);
app.use('/api/dashboard', dashboardRoutes);

// Catch 404 for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: true,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Serve frontend static assets in production/local bundle
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

module.exports = app;
