/**
 * Authentication Controller
 *
 * Handles user registration, login, and retrieval of current profile.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, TOKEN_EXPIRY } = require('../config/auth');
const { validateEmail, sanitize } = require('../middleware/validate');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Name, email, and password are required.',
      });
    }

    const cleanName = sanitize(name);
    const cleanEmail = String(email).trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        error: true,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check for existing user
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: true,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password & store user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `);
    const result = insertStmt.run(cleanName, cleanEmail, passwordHash);
    const userId = Number(result.lastInsertRowid);

    const userPayload = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Log in an existing user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Query user record
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password.',
      });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
function getMe(req, res, next) {
  try {
    // req.user is attached by the authenticate middleware
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
