const axios = require('axios');
const { generateToken, verifyToken } = require('./windowsAuthService');

// DSpace configuration
const DSPACE_CONFIG = {
  baseUrl: process.env.DSPACE_URL || 'http://localhost:8080',
  apiVersion: process.env.DSPACE_API_VERSION || 'v7',
  username: process.env.DSPACE_USERNAME || 'dspace@dspace.org',
  password: process.env.DSPACE_PASSWORD || 'dspace',
  timeout: 30000
};

// DSpace API endpoints
const API_ENDPOINTS = {
  auth: '/server/api/authn/login',
  logout: '/server/api/authn/logout',
  collections: '/server/api/core/collections',
  items: '/server/api/core/items',
  bitstreams: '/server/api/core/bitstreams',
  bundles: '/server/api/core/bundles',
  communities: '/server/api/core/communities',
  epersons: '/server/api/eperson/epersons',
  groups: '/server/api/eperson/groups',
  workflows: '/server/api/workflow/workflowitems',
  tasks: '/server/api/workflow/tasks'
};

let dspaceToken = null;
let tokenExpiry = null;

/**
 * Authenticate with DSpace using Windows SSO credentials
 * @param {object} user - Authenticated Windows user
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
async function authenticateWithDSpace(user) {
  try {
    // Create or get DSpace eperson for Windows user
    const eperson = await getOrCreateEperson(user);
    
    // Authenticate with DSpace
    const response = await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.auth}`, {
      user: eperson.email,
      password: eperson.password // This would be a generated password for SSO users
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: DSPACE_CONFIG.timeout
    });

    if (response.data && response.data.token) {
      dspaceToken = response.data.token;
      tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      return { success: true, token: dspaceToken };
    }

    return { success: false, error: 'DSpace authentication failed' };
  } catch (error) {
    console.error('DSpace authentication error:', error.message);
    return { success: false, error: 'DSpace authentication failed' };
  }
}

/**
 * Get or create DSpace eperson for Windows user
 * @param {object} user - Windows authenticated user
 * @returns {Promise<object>} - DSpace eperson object
 */
async function getOrCreateEperson(user) {
  try {
    // Check if eperson exists
    const existingEperson = await findEpersonByEmail(user.email);
    
    if (existingEperson) {
      // Update eperson with latest Windows user info
      return await updateEperson(existingEperson.id, user);
    }

    // Create new eperson
    return await createEperson(user);
  } catch (error) {
    console.error('Error getting/creating eperson:', error);
    throw error;
  }
}

/**
 * Find DSpace eperson by email
 * @param {string} email - User email
 * @returns {Promise<object|null>} - Eperson object or null
 */
async function findEpersonByEmail(email) {
  try {
    const response = await axios.get(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.epersons}/search/byEmail`, {
      params: { email },
      headers: getAuthHeaders(),
      timeout: DSPACE_CONFIG.timeout
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create new DSpace eperson
 * @param {object} user - Windows user data
 * @returns {Promise<object>} - Created eperson
 */
async function createEperson(user) {
  const epersonData = {
    email: user.email,
    firstName: user.displayName.split(' ')[0] || user.username,
    lastName: user.displayName.split(' ').slice(1).join(' ') || user.username,
    canLogin: true,
    requireCertificate: false,
    selfRegistered: false,
    netid: user.username // Windows username as netid
  };

  const response = await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.epersons}`, epersonData, {
    headers: getAuthHeaders(),
    timeout: DSPACE_CONFIG.timeout
  });

  // Assign user to appropriate DSpace groups based on role
  await assignUserToGroups(response.data.id, user.role);

  return response.data;
}

/**
 * Update existing DSpace eperson
 * @param {string} epersonId - DSpace eperson ID
 * @param {object} user - Updated user data
 * @returns {Promise<object>} - Updated eperson
 */
async function updateEperson(epersonId, user) {
  const updateData = {
    firstName: user.displayName.split(' ')[0] || user.username,
    lastName: user.displayName.split(' ').slice(1).join(' ') || user.username,
    netid: user.username
  };

  const response = await axios.patch(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.epersons}/${epersonId}`, updateData, {
    headers: getAuthHeaders(),
    timeout: DSPACE_CONFIG.timeout
  });

  // Update group membership
  await assignUserToGroups(epersonId, user.role);

  return response.data;
}

/**
 * Assign user to DSpace groups based on role
 * @param {string} epersonId - DSpace eperson ID
 * @param {string} role - User role
 * @returns {Promise<void>}
 */
async function assignUserToGroups(epersonId, role) {
  const groupMappings = {
    student: ['Students', 'Dissertation_Submitters'],
    librarian: ['Librarians', 'Dissertation_Reviewers', 'Collection_Managers'],
    reviewer: ['Reviewers', 'Dissertation_Reviewers'],
    admin: ['Administrators', 'System_Administrators']
  };

  const groups = groupMappings[role] || groupMappings.student;

  for (const groupName of groups) {
    try {
      const group = await findGroupByName(groupName);
      if (group) {
        await addUserToGroup(epersonId, group.id);
      }
    } catch (error) {
      console.warn(`Failed to add user to group ${groupName}:`, error.message);
    }
  }
}

/**
 * Find DSpace group by name
 * @param {string} groupName - Group name
 * @returns {Promise<object|null>} - Group object or null
 */
async function findGroupByName(groupName) {
  try {
    const response = await axios.get(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.groups}/search/byName`, {
      params: { name: groupName },
      headers: getAuthHeaders(),
      timeout: DSPACE_CONFIG.timeout
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Add user to DSpace group
 * @param {string} epersonId - DSpace eperson ID
 * @param {string} groupId - DSpace group ID
 * @returns {Promise<void>}
 */
async function addUserToGroup(epersonId, groupId) {
  await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.groups}/${groupId}/epersons`, {
    id: epersonId
  }, {
    headers: getAuthHeaders(),
    timeout: DSPACE_CONFIG.timeout
  });
}

/**
 * Get authentication headers for DSpace API
 * @returns {object} - Headers object
 */
function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (dspaceToken && tokenExpiry && Date.now() < tokenExpiry) {
    headers['Authorization'] = `Bearer ${dspaceToken}`;
  }

  return headers;
}

/**
 * Submit dissertation to DSpace
 * @param {object} submissionData - Submission data
 * @param {object} user - Authenticated user
 * @returns {Promise<{success: boolean, itemId?: string, error?: string}>}
 */
async function submitDissertation(submissionData, user) {
  try {
    // Ensure authenticated with DSpace
    if (!dspaceToken || Date.now() >= tokenExpiry) {
      const authResult = await authenticateWithDSpace(user);
      if (!authResult.success) {
        return { success: false, error: 'DSpace authentication failed' };
      }
    }

    // Create item in DSpace
    const itemData = {
      name: submissionData.title,
      metadata: {
        'dc.title': submissionData.title,
        'dc.contributor.author': user.displayName,
        'dc.contributor.author': user.email,
        'dc.date.issued': new Date().toISOString().split('T')[0],
        'dc.type': 'Dissertation',
        'dc.subject': submissionData.keywords || [],
        'dc.description.abstract': submissionData.abstract || '',
        'dc.language.iso': submissionData.language || 'en',
        'dc.publisher': 'University Repository',
        'dc.rights': submissionData.rights || 'All rights reserved'
      }
    };

    const response = await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.items}`, itemData, {
      headers: getAuthHeaders(),
      timeout: DSPACE_CONFIG.timeout
    });

    const itemId = response.data.id;

    // Upload files if provided
    if (submissionData.files && submissionData.files.length > 0) {
      for (const file of submissionData.files) {
        await uploadFile(itemId, file);
      }
    }

    return { success: true, itemId };
  } catch (error) {
    console.error('DSpace submission error:', error);
    return { success: false, error: 'Submission failed' };
  }
}

/**
 * Upload file to DSpace item
 * @param {string} itemId - DSpace item ID
 * @param {object} file - File object
 * @returns {Promise<void>}
 */
async function uploadFile(itemId, file) {
  // Create bundle
  const bundleResponse = await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.items}/${itemId}/bundles`, {
    name: 'ORIGINAL'
  }, {
    headers: getAuthHeaders(),
    timeout: DSPACE_CONFIG.timeout
  });

  const bundleId = bundleResponse.data.id;

  // Upload bitstream
  const formData = new FormData();
  formData.append('file', file.data, file.name);

  await axios.post(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.bundles}/${bundleId}/bitstreams`, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data'
    },
    timeout: DSPACE_CONFIG.timeout
  });
}

/**
 * Get user's submissions from DSpace
 * @param {object} user - Authenticated user
 * @returns {Promise<Array>} - Array of submissions
 */
async function getUserSubmissions(user) {
  try {
    if (!dspaceToken || Date.now() >= tokenExpiry) {
      const authResult = await authenticateWithDSpace(user);
      if (!authResult.success) {
        return [];
      }
    }

    const response = await axios.get(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.items}/search/byAuthor`, {
      params: { author: user.email },
      headers: getAuthHeaders(),
      timeout: DSPACE_CONFIG.timeout
    });

    return response.data._embedded.items || [];
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }
}

/**
 * Get submissions for review (librarian/reviewer view)
 * @param {object} user - Authenticated user
 * @returns {Promise<Array>} - Array of submissions for review
 */
async function getSubmissionsForReview(user) {
  try {
    if (!dspaceToken || Date.now() >= tokenExpiry) {
      const authResult = await authenticateWithDSpace(user);
      if (!authResult.success) {
        return [];
      }
    }

    // Get workflow items based on user role
    const response = await axios.get(`${DSPACE_CONFIG.baseUrl}${API_ENDPOINTS.workflows}`, {
      headers: getAuthHeaders(),
      timeout: DSPACE_CONFIG.timeout
    });

    return response.data._embedded.workflowitems || [];
  } catch (error) {
    console.error('Error fetching submissions for review:', error);
    return [];
  }
}

module.exports = {
  authenticateWithDSpace,
  submitDissertation,
  getUserSubmissions,
  getSubmissionsForReview,
  getAuthHeaders,
  DSPACE_CONFIG
};