/**
 * Authentication middleware.
 *
 * Reads the Authorization header:  Bearer <token>
 * Attaches decoded { id, role } to req.user on success.
 * Returns 401 if the token is missing, malformed, or expired.
 */

import { verifyToken } from '../utils/jwt.js';

export function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = header.slice(7);
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}
