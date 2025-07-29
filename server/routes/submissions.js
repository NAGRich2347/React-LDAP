const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  getCurrentUser,
  getAllUsers,
  getUserByUsername,
  submitDissertation,
  getUserSubmissions,
  getSubmissionsForReview,
  getSubmissionById,
  updateSubmissionStatus,
  getSubmissionStats,
  searchSubmissions,
  deleteSubmission,
  healthCheck
} = require('../controllers/submissionController');

const {
  authenticateToken,
  requireStudent,
  requireLibrarian,
  requireReviewer,
  requireAdmin,
  requireStaff,
  optionalAuth
} = require('../middleware/authMiddleware');

// Health check endpoint (no authentication required)
router.get('/health', healthCheck);

// Authentication routes
router.post('/auth/login', login);
router.post('/auth/logout', authenticateToken, logout);
router.get('/auth/me', authenticateToken, getCurrentUser);

// User management routes (admin only)
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/users/:username', authenticateToken, requireAdmin, getUserByUsername);

// Submission routes
router.post('/submit', authenticateToken, requireStudent, submitDissertation);
router.get('/my-submissions', authenticateToken, requireStudent, getUserSubmissions);
router.get('/submissions', authenticateToken, requireStaff, getSubmissionsForReview);
router.get('/submissions/:id', authenticateToken, getSubmissionById);
router.put('/submissions/:id/status', authenticateToken, requireStaff, updateSubmissionStatus);
router.delete('/submissions/:id', authenticateToken, requireAdmin, deleteSubmission);

// Search and statistics
router.get('/search', authenticateToken, searchSubmissions);
router.get('/stats', authenticateToken, getSubmissionStats);

// File upload route (protected)
router.post('/upload', authenticateToken, (req, res) => {
  try {
    // Validate file presence
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.files.file;
    
    // Allowed MIME types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type.' });
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB.' });
    }
    
    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // Return file info for processing
    res.json({
      success: true,
      file: {
        name: safeName,
        size: file.size,
        mimetype: file.mimetype,
        data: file.data.toString('base64') // Convert to base64 for transmission
      }
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Role-specific dashboard data
router.get('/dashboard/student', authenticateToken, requireStudent, async (req, res) => {
  try {
    const stats = await getSubmissionStats(req.user);
    res.json({
      success: true,
      dashboard: {
        type: 'student',
        user: req.user,
        stats: stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/dashboard/librarian', authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const stats = await getSubmissionStats(req.user);
    res.json({
      success: true,
      dashboard: {
        type: 'librarian',
        user: req.user,
        stats: stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/dashboard/reviewer', authenticateToken, requireReviewer, async (req, res) => {
  try {
    const stats = await getSubmissionStats(req.user);
    res.json({
      success: true,
      dashboard: {
        type: 'reviewer',
        user: req.user,
        stats: stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

router.get('/dashboard/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await getSubmissionStats(req.user);
    res.json({
      success: true,
      dashboard: {
        type: 'admin',
        user: req.user,
        stats: stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = router;