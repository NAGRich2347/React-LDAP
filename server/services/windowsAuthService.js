const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const ActiveDirectory = require('activedirectory2');

// Load domain configuration
const DOMAIN_CONFIG = {
  url: process.env.AD_SERVER || 'ldap://your-domain-controller.com',
  baseDN: process.env.AD_BASE_DN || 'DC=yourdomain,DC=com',
  username: process.env.AD_USERNAME || process.env.AD_SERVICE_USERNAME || 'service-account@yourdomain.com',
  password: process.env.AD_PASSWORD || process.env.AD_SERVICE_PASSWORD || 'service-password',
  domain: process.env.AD_DOMAIN || undefined,
  groups: {
    students: process.env.AD_STUDENT_GROUP || 'CN=Students,OU=Groups,DC=yourdomain,DC=com',
    librarians: process.env.AD_LIBRARIAN_GROUP || 'CN=Librarians,OU=Groups,DC=yourdomain,DC=com',
    reviewers: process.env.AD_REVIEWER_GROUP || 'CN=Reviewers,OU=Groups,DC=yourdomain,DC=com',
    admins: process.env.AD_ADMIN_GROUP || 'CN=Admins,OU=Groups,DC=yourdomain,DC=com'
  }
};

function buildADInstance() {
  const config = {
    url: DOMAIN_CONFIG.url,
    baseDN: DOMAIN_CONFIG.baseDN,
    username: DOMAIN_CONFIG.username,
    password: DOMAIN_CONFIG.password,
    tlsOptions: { rejectUnauthorized: false }
  };
  return new ActiveDirectory(config);
}

/**
 * Get AD group membership for a user
 * @param {string} usernameOrUpn
 * @returns {Promise<Array>} groups
 */
async function getUserGroupsFromAD(usernameOrUpn) {
  const ad = buildADInstance();
  const upn = DOMAIN_CONFIG.domain && !String(usernameOrUpn).includes('@')
    ? `${usernameOrUpn}@${DOMAIN_CONFIG.domain}`
    : usernameOrUpn;
  return await new Promise((resolve) => {
    ad.getGroupMembershipForUser(upn, (err, groups) => {
      if (err) {
        console.error('AD groups error:', err);
        return resolve([]);
      }
      resolve(groups || []);
    });
  });
}

// Hypothetical user data for testing
const HYPOTHETICAL_USERS = {
  students: [
    { username: 'john.smith', displayName: 'John Smith', email: 'john.smith@university.edu', studentId: 'S2024001' },
    { username: 'sarah.jones', displayName: 'Sarah Jones', email: 'sarah.jones@university.edu', studentId: 'S2024002' },
    { username: 'michael.brown', displayName: 'Michael Brown', email: 'michael.brown@university.edu', studentId: 'S2024003' },
    { username: 'emily.davis', displayName: 'Emily Davis', email: 'emily.davis@university.edu', studentId: 'S2024004' },
    { username: 'david.wilson', displayName: 'David Wilson', email: 'david.wilson@university.edu', studentId: 'S2024005' }
  ],
  librarians: [
    { username: 'dr.martinez', displayName: 'Dr. Maria Martinez', email: 'm.martinez@university.edu', department: 'Library Sciences' },
    { username: 'prof.thompson', displayName: 'Prof. Robert Thompson', email: 'r.thompson@university.edu', department: 'Digital Archives' },
    { username: 'ms.chen', displayName: 'Ms. Lisa Chen', email: 'l.chen@university.edu', department: 'Research Support' }
  ],
  reviewers: [
    { username: 'dr.anderson', displayName: 'Dr. James Anderson', email: 'j.anderson@university.edu', department: 'Computer Science' },
    { username: 'prof.garcia', displayName: 'Prof. Elena Garcia', email: 'e.garcia@university.edu', department: 'Information Systems' },
    { username: 'dr.kumar', displayName: 'Dr. Rajesh Kumar', email: 'r.kumar@university.edu', department: 'Data Science' }
  ],
  admins: [
    { username: 'admin.rodriguez', displayName: 'Admin Carlos Rodriguez', email: 'c.rodriguez@university.edu', role: 'System Administrator' },
    { username: 'admin.patel', displayName: 'Admin Priya Patel', email: 'p.patel@university.edu', role: 'IT Manager' }
  ]
};

/**
 * Authenticate user against Active Directory (Production Mode)
 * @param {string} username - Domain username
 * @param {string} password - Domain password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
async function authenticateWithAD(username, password) {
  try {
    const ad = buildADInstance();
    // Allow either userPrincipalName (user@domain) or sAMAccountName
    const upn = DOMAIN_CONFIG.domain && !username.includes('@')
      ? `${username}@${DOMAIN_CONFIG.domain}`
      : username;

    const isValid = await new Promise((resolve) => {
      ad.authenticate(upn, password, (err, auth) => {
        if (err) {
          console.error('AD authenticate error:', err);
          return resolve(false);
        }
        resolve(Boolean(auth));
      });
    });

    if (!isValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const [user, groups] = await Promise.all([
      new Promise((resolve) => {
        ad.findUser(upn, (err, user) => {
          if (err) {
            console.error('AD findUser error:', err);
            return resolve(null);
          }
          resolve(user);
        });
      }),
      new Promise((resolve) => {
        ad.getGroupMembershipForUser(upn, (err, groups) => {
          if (err) {
            console.error('AD groups error:', err);
            return resolve([]);
          }
          resolve(groups || []);
        });
      })
    ]);

    const role = determineUserRole(groups);
    const normalizedUser = {
      username: user?.sAMAccountName || user?.userPrincipalName || username,
      displayName: user?.displayName || username,
      email: user?.mail || `${username}@${DOMAIN_CONFIG.domain || 'local'}`,
      role,
      groups: (groups || []).map(g => (typeof g === 'string' ? g : g.cn || g.dn || ''))
    };

    return { success: true, user: normalizedUser };
  } catch (error) {
    console.error('authenticateWithAD unexpected error:', error);
    // Fallback to simulation in development
    if (process.env.NODE_ENV !== 'production') {
      return simulateWindowsAuth(username, password);
    }
    return { success: false, error: 'AD authentication failed' };
  }
}

/**
 * Determine user role based on AD group membership
 * @param {Array} groups - User's AD groups
 * @returns {string} - User role
 */
function determineUserRole(groups) {
  if (!groups || !Array.isArray(groups)) {
    return 'student'; // Default role
  }

  const groupNames = groups.map(group => {
    if (typeof group === 'string') return group.toLowerCase();
    if (group.cn) return String(group.cn).toLowerCase();
    if (group.dn) return String(group.dn).toLowerCase();
    return '';
  });
  
  if (groupNames.some(group => group.includes('admin') || group.includes('administrator') || group.includes('domain admins'))) {
    return 'admin';
  } else if (groupNames.some(group => group.includes('librarian') || group.includes('library'))) {
    return 'librarian';
  } else if (groupNames.some(group => group.includes('reviewer') || group.includes('review'))) {
    return 'reviewer';
  } else if (groupNames.some(group => group.includes('student') || group.includes('undergraduate') || group.includes('graduate'))) {
    return 'student';
  }
  
  return 'student'; // Default role
}

/**
 * Generate JWT token for authenticated user
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'your-jwt-secret');
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
  } catch (error) {
    return null;
  }
}

/**
 * Get hypothetical user data for testing
 * @param {string} role - User role
 * @returns {Array} - Array of hypothetical users
 */
function getHypotheticalUsers(role = null) {
  if (role) {
    return HYPOTHETICAL_USERS[role] || [];
  }
  return HYPOTHETICAL_USERS;
}

/**
 * Simulate Windows SSO authentication for development/testing
 * @param {string} username - Username
 * @param {string} password - Password (ignored in simulation)
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
async function simulateWindowsAuth(username, password) {
  // Find user in hypothetical data
  for (const [role, users] of Object.entries(HYPOTHETICAL_USERS)) {
    const user = users.find(u => u.username === username);
    if (user) {
      return {
        success: true,
        user: {
          ...user,
          role: role,
          groups: [`CN=${role.charAt(0).toUpperCase() + role.slice(1)}s,OU=Groups,DC=university,DC=edu`]
        }
      };
    }
  }
  
  return { success: false, error: 'User not found' };
}

module.exports = {
  authenticateWithAD,
  determineUserRole,
  generateToken,
  verifyToken,
  getHypotheticalUsers,
  simulateWindowsAuth,
  DOMAIN_CONFIG,
  getUserGroupsFromAD
}; 