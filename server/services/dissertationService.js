const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

// Data storage paths
const DATA_DIR = path.join(__dirname, '../data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FILES_DIR = path.join(DATA_DIR, 'files');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Initialize data files if they don't exist
if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

/**
 * Load data from JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Array} - Array of data
 */
function loadData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
    return [];
  }
}

/**
 * Save data to JSON file
 * @param {string} filePath - Path to JSON file
 * @param {Array} data - Data to save
 */
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    throw error;
  }
}

/**
 * Submit a dissertation
 * @param {object} submissionData - Submission data
 * @param {object} user - Authenticated user
 * @returns {Promise<{success: boolean, submissionId?: string, error?: string}>}
 */
async function submitDissertation(submissionData, user) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    
    const submission = {
      id: uuidv4(),
      title: submissionData.title,
      abstract: submissionData.abstract || '',
      keywords: submissionData.keywords || [],
      language: submissionData.language || 'en',
      rights: submissionData.rights || 'All rights reserved',
      author: {
        username: user.username,
        displayName: user.displayName,
        email: user.email
      },
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
      metadata: {
        department: user.department || '',
        studentId: user.studentId || '',
        degree: submissionData.degree || 'PhD',
        year: new Date().getFullYear()
      },
      reviews: [],
      workflow: {
        currentStep: 'submitted',
        steps: [
          { step: 'submitted', completed: true, date: new Date().toISOString() },
          { step: 'review', completed: false, date: null },
          { step: 'approved', completed: false, date: null },
          { step: 'published', completed: false, date: null }
        ]
      }
    };

    // Handle file uploads
    if (submissionData.files && submissionData.files.length > 0) {
      for (const file of submissionData.files) {
        const fileId = uuidv4();
        const fileName = `${fileId}_${file.name}`;
        const filePath = path.join(FILES_DIR, fileName);
        
        // Save file
        fs.writeFileSync(filePath, Buffer.from(file.data, 'base64'));
        
        submission.files.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.mimetype,
          path: fileName,
          uploadedAt: new Date().toISOString()
        });
      }
    }

    submissions.push(submission);
    saveData(SUBMISSIONS_FILE, submissions);

    return { success: true, submissionId: submission.id };
  } catch (error) {
    console.error('Error submitting dissertation:', error);
    return { success: false, error: 'Submission failed' };
  }
}

/**
 * Get user's submissions
 * @param {object} user - Authenticated user
 * @returns {Promise<Array>} - Array of user's submissions
 */
async function getUserSubmissions(user) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    return submissions.filter(sub => sub.author.username === user.username);
  } catch (error) {
    console.error('Error getting user submissions:', error);
    return [];
  }
}

/**
 * Get all submissions for review (staff view)
 * @param {object} user - Authenticated user
 * @returns {Promise<Array>} - Array of submissions for review
 */
async function getSubmissionsForReview(user) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    
    // Filter based on user role
    if (user.role === 'admin') {
      return submissions; // Admins see all submissions
    } else if (user.role === 'librarian') {
      return submissions.filter(sub => 
        ['submitted', 'under_review', 'needs_revision'].includes(sub.status)
      );
    } else if (user.role === 'reviewer') {
      return submissions.filter(sub => 
        ['submitted', 'under_review'].includes(sub.status)
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error getting submissions for review:', error);
    return [];
  }
}

/**
 * Get submission by ID
 * @param {string} submissionId - Submission ID
 * @returns {Promise<object|null>} - Submission object or null
 */
async function getSubmissionById(submissionId) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    return submissions.find(sub => sub.id === submissionId) || null;
  } catch (error) {
    console.error('Error getting submission by ID:', error);
    return null;
  }
}

/**
 * Update submission status
 * @param {string} submissionId - Submission ID
 * @param {string} status - New status
 * @param {object} user - User making the change
 * @param {string} comment - Optional comment
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function updateSubmissionStatus(submissionId, status, user, comment = '') {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    const submission = submissions.find(sub => sub.id === submissionId);
    
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Update status
    submission.status = status;
    submission.updatedAt = new Date().toISOString();

    // Add review comment if provided
    if (comment) {
      submission.reviews.push({
        id: uuidv4(),
        reviewer: {
          username: user.username,
          displayName: user.displayName,
          role: user.role
        },
        comment: comment,
        status: status,
        date: new Date().toISOString()
      });
    }

    // Update workflow
    const workflowStep = submission.workflow.steps.find(step => step.step === status);
    if (workflowStep) {
      workflowStep.completed = true;
      workflowStep.date = new Date().toISOString();
    }

    saveData(SUBMISSIONS_FILE, submissions);
    return { success: true };
  } catch (error) {
    console.error('Error updating submission status:', error);
    return { success: false, error: 'Update failed' };
  }
}

/**
 * Get submission statistics
 * @param {object} user - Authenticated user
 * @returns {Promise<object>} - Statistics object
 */
async function getSubmissionStats(user) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    
    if (user.role === 'student') {
      const userSubmissions = submissions.filter(sub => sub.author.username === user.username);
      return {
        total: userSubmissions.length,
        submitted: userSubmissions.filter(sub => sub.status === 'submitted').length,
        underReview: userSubmissions.filter(sub => sub.status === 'under_review').length,
        approved: userSubmissions.filter(sub => sub.status === 'approved').length,
        published: userSubmissions.filter(sub => sub.status === 'published').length
      };
    } else {
      // Staff statistics
      return {
        total: submissions.length,
        submitted: submissions.filter(sub => sub.status === 'submitted').length,
        underReview: submissions.filter(sub => sub.status === 'under_review').length,
        approved: submissions.filter(sub => sub.status === 'approved').length,
        published: submissions.filter(sub => sub.status === 'published').length,
        needsRevision: submissions.filter(sub => sub.status === 'needs_revision').length
      };
    }
  } catch (error) {
    console.error('Error getting submission stats:', error);
    return { total: 0, submitted: 0, underReview: 0, approved: 0, published: 0 };
  }
}

/**
 * Search submissions
 * @param {object} searchParams - Search parameters
 * @param {object} user - Authenticated user
 * @returns {Promise<Array>} - Array of matching submissions
 */
async function searchSubmissions(searchParams, user) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    let results = submissions;

    // Filter by user role
    if (user.role === 'student') {
      results = results.filter(sub => sub.author.username === user.username);
    }

    // Filter by status
    if (searchParams.status) {
      results = results.filter(sub => sub.status === searchParams.status);
    }

    // Filter by title/keywords
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      results = results.filter(sub => 
        sub.title.toLowerCase().includes(query) ||
        sub.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
        sub.abstract.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (searchParams.startDate) {
      results = results.filter(sub => new Date(sub.submittedAt) >= new Date(searchParams.startDate));
    }
    if (searchParams.endDate) {
      results = results.filter(sub => new Date(sub.submittedAt) <= new Date(searchParams.endDate));
    }

    return results;
  } catch (error) {
    console.error('Error searching submissions:', error);
    return [];
  }
}

/**
 * Delete submission (admin only)
 * @param {string} submissionId - Submission ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteSubmission(submissionId) {
  try {
    const submissions = loadData(SUBMISSIONS_FILE);
    const submission = submissions.find(sub => sub.id === submissionId);
    
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Delete associated files
    for (const file of submission.files) {
      const filePath = path.join(FILES_DIR, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from submissions
    const updatedSubmissions = submissions.filter(sub => sub.id !== submissionId);
    saveData(SUBMISSIONS_FILE, updatedSubmissions);

    return { success: true };
  } catch (error) {
    console.error('Error deleting submission:', error);
    return { success: false, error: 'Delete failed' };
  }
}

module.exports = {
  submitDissertation,
  getUserSubmissions,
  getSubmissionsForReview,
  getSubmissionById,
  updateSubmissionStatus,
  getSubmissionStats,
  searchSubmissions,
  deleteSubmission
}; 