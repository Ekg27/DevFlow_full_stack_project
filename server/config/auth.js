/**
 * JWT Authentication Configuration
 *
 * Centralizes JWT settings so they can be imported
 * by both the auth middleware and auth controller.
 */

// Secret key used to sign and verify JSON Web Tokens
const JWT_SECRET = process.env.JWT_SECRET || 'devflow-secret-key-2024';

// Token validity duration
const TOKEN_EXPIRY = '24h';

module.exports = { JWT_SECRET, TOKEN_EXPIRY };
