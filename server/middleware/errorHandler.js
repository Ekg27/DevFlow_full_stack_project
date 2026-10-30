/**
 * Centralized Error Handler Middleware
 *
 * Catches all unhandled errors thrown or passed via next(err)
 * and returns a consistent JSON response.
 */

function errorHandler(err, req, res, _next) {
  // Log the full error for debugging
  console.error('❌ Error:', err.message || err);
  if (err.stack) {
    console.error(err.stack);
  }

  // Determine the status code
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: true,
    message,
  });
}

module.exports = errorHandler;
