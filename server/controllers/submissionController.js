const { authenticate, getUsers, getUserByUsername } = require('../services/authService');
const { 
  submitDissertation, 
  getUserSubmissions, 
  getSubmissionsForReview,
  getSubmissionById,
  updateSubmissionStatus,
  getSubmissionStats,
  searchSubmissions,
  deleteSubmission
} = require('../services/dissertationService');

/**
 * Authenticate user with Windows SSO or local authentication
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function login(req, res) {
  try {
    const { username, password, useWindowsAuth = true } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const authResult = await authenticate(username, password, useWindowsAuth);

    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    res.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current user information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: req.user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all users (for admin purposes)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function getAllUsers(req, res) {
  try {
    const { role } = req.query;
    const users = getUsers(role);

    res.json({
      success: true,
      users: users,
      total: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Submit dissertation
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function submitDissertationController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, abstract, keywords, language, rights, degree, files } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const submissionData = {
      title,
      abstract,
      keywords: keywords || [],
      language: language || 'en',
      rights: rights || 'All rights reserved',
      degree: degree || 'PhD',
      files: files || []
    };

    const result = await submitDissertation(submissionData, req.user);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      submissionId: result.submissionId,
      message: 'Dissertation submitted successfully'
    });

  } catch (error) {
    console.error('Submit dissertation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get user's submissions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getUserSubmissionsController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const submissions = await getUserSubmissions(req.user);

    res.json({
      success: true,
      submissions: submissions,
      total: submissions.length
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get submissions for review (staff view)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getSubmissionsForReviewController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has review permissions
    if (!['librarian', 'reviewer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for review' });
    }

    const submissions = await getSubmissionsForReview(req.user);

    res.json({
      success: true,
      submissions: submissions,
      total: submissions.length
    });

  } catch (error) {
    console.error('Get submissions for review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get submission by ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getSubmissionByIdController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && submission.author.username !== req.user.username) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      submission: submission
    });

  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update submission status
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function updateSubmissionStatusController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has review permissions
    if (!['librarian', 'reviewer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = await updateSubmissionStatus(id, status, req.user, comment);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Submission status updated successfully'
    });

  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get submission statistics
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getSubmissionStatsController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const stats = await getSubmissionStats(req.user);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Search submissions
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function searchSubmissionsController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const searchParams = req.query;
    const submissions = await searchSubmissions(searchParams, req.user);

    res.json({
      success: true,
      submissions: submissions,
      total: submissions.length
    });

  } catch (error) {
    console.error('Search submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete submission (admin only)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function deleteSubmissionController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const result = await deleteSubmission(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get user by username
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function getUserByUsernameController(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Logout user (invalidate token)
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function logout(req, res) {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Health check endpoint
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function healthCheck(req, res) {
  res.json({
    success: true,
    message: 'Dissertation submission server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      windowsSSO: true,
      customBackend: true,
      roleDelegation: true,
      fileUpload: true
    }
  });
}

module.exports = {
  login,
  logout,
  getCurrentUser,
  getAllUsers,
  getUserByUsername: getUserByUsernameController,
  submitDissertation: submitDissertationController,
  getUserSubmissions: getUserSubmissionsController,
  getSubmissionsForReview: getSubmissionsForReviewController,
  getSubmissionById: getSubmissionByIdController,
  updateSubmissionStatus: updateSubmissionStatusController,
  getSubmissionStats: getSubmissionStatsController,
  searchSubmissions: searchSubmissionsController,
  deleteSubmission: deleteSubmissionController,
  healthCheck
};