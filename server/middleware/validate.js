/**
 * Input Validation Helpers
 *
 * Reusable middleware and utility functions for validating
 * and sanitizing user input.
 */

/**
 * validateRequired(fields)
 *
 * Returns a middleware that checks req.body contains non-empty
 * values for every field name listed in the array.
 *
 * Usage: router.post('/', validateRequired(['name', 'email']), handler)
 */
function validateRequired(fields) {
  return (req, res, next) => {
    const missing = [];

    for (const field of fields) {
      const value = req.body[field];

      // Treat null, undefined, and blank strings as missing
      if (value === undefined || value === null || String(value).trim() === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * validateEmail(email)
 *
 * Returns true if the string looks like a valid email address.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * sanitize(str)
 *
 * Trims whitespace and strips basic HTML tags to prevent
 * injection in text fields.
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/<[^>]*>/g, '');
}

module.exports = { validateRequired, validateEmail, sanitize };
