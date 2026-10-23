/**
 * JWT utility helpers.
 *
 * Reads JWT_SECRET from .env — set this to a long, random string in production.
 * JWT_EXPIRES_IN defaults to 7 days.
 */

import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'collabsphere_dev_secret_change_in_prod';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT containing the user's MongoDB _id and role.
 * @param {Object} payload  - { id: string, role: string }
 * @returns {string} signed token
 */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError / TokenExpiredError on failure.
 * @param {string} token
 * @returns {Object} decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
