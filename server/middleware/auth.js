/**
 * JWT Authentication Middleware
 *
 * Protects routes by verifying the Bearer token in the
 * Authorization header. On success, attaches user info
 * (id, email, name) to req.user for downstream handlers.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');
const db = require('../config/db');

function authenticate(req, res, next) {
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);

    // Confirm the user still exists in the database
    const user = db
      .prepare('SELECT id, email, name FROM users WHERE id = ?')
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token. User no longer exists.',
      });
    }

    // Attach user info for downstream route handlers
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (err) {
    // jwt.verify throws on expired or malformed tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Token has expired.' });
    }
    return res.status(401).json({ error: true, message: 'Invalid token.' });
  }
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
