const { verifyAuthToken, hasRole } = require('../services/authService');

/**
 * Middleware to verify JWT token and attach user to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const user = verifyAuthToken(token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

/**
 * Middleware to check if user has required role(s)
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {function} - Express middleware function
 */
function requireRole(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasRole(req.user, requiredRoles)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRoles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is authenticated (optional)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const user = verifyAuthToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

/**
 * Middleware to check if user is a student
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function requireStudent(req, res, next) {
  return requireRole('student')(req, res, next);
}

/**
 * Middleware to check if user is a librarian
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function requireLibrarian(req, res, next) {
  return requireRole('librarian')(req, res, next);
}

/**
 * Middleware to check if user is a reviewer
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function requireReviewer(req, res, next) {
  return requireRole('reviewer')(req, res, next);
}

/**
 * Middleware to check if user is an admin
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

/**
 * Middleware to check if user is staff (librarian, reviewer, or admin)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function requireStaff(req, res, next) {
  return requireRole(['librarian', 'reviewer', 'admin'])(req, res, next);
}

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  requireStudent,
  requireLibrarian,
  requireReviewer,
  requireAdmin,
  requireStaff
}; 