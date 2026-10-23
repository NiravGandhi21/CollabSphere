/**
 * Global Error Handler Middleware.
 *
 * Handles:
 *  - Mongoose ValidationError  → 400
 *  - Mongoose CastError        → 400 (Invalid ObjectId format)
 *  - MongoDB Duplicate Key (11000) → 400 (Custom messaging for email and collaborations)
 *  - JWT errors                → 401
 *  - Zod validation errors     → 422
 *  - Everything else           → 500
 */

export function errorHandler(err, _req, res, _next) {
  // Only log detailed internal stack traces in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ErrorHandler]', err);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Mongoose invalid ObjectId CastError
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid identifier format for ${err.path}: ${err.value}` });
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    if (err.keyPattern?.email || err.keyValue?.email) {
      return res.status(400).json({
        message: 'Email is already registered. Please sign in instead.',
      });
    }
    if (err.keyPattern?.projectId && err.keyPattern?.applicantId) {
      return res.status(400).json({
        message: 'You already have a pending request for this project.',
      });
    }
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'record';
    return res.status(400).json({
      message: `A duplicate record was detected for ${field}.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }

  // Zod schema validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(422).json({ message: messages.join('. ') });
  }

  // Application-defined HTTP errors (with explicit err.status)
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  // Unhandled internal server error
  res.status(500).json({ message: 'An unexpected server error occurred. Please try again.' });
}
