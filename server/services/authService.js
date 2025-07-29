const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { 
  authenticateWithAD, 
  simulateWindowsAuth, 
  generateToken, 
  verifyToken,
  getHypotheticalUsers 
} = require('./windowsAuthService');

// Load users from users.json for fallback authentication
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json'), 'utf-8'));

/**
 * Authenticate a user using Windows SSO or fallback to local authentication
 * @param {string} username
 * @param {string} password
 * @param {boolean} useWindowsAuth - Whether to use Windows authentication
 * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
 */
async function authenticate(username, password, useWindowsAuth = true) {
  try {
    let authResult;

    if (useWindowsAuth) {
      // Try Windows SSO authentication first
      if (process.env.NODE_ENV === 'development') {
        // Use simulation for development
        authResult = await simulateWindowsAuth(username, password);
      } else {
        // Use real Active Directory authentication
        authResult = await authenticateWithAD(username, password);
      }

      if (authResult.success) {
        // Generate JWT token for Windows authenticated user
        const token = generateToken(authResult.user);
        return {
          success: true,
          user: authResult.user,
          token: token
        };
      }
    }

    // Fallback to local authentication
    const user = users.find(u => u.username === username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create user object for local authentication
    const localUser = {
      username: user.username,
      role: user.role,
      displayName: user.username,
      email: `${user.username}@university.edu`
    };

    const token = generateToken(localUser);
    return {
      success: true,
      user: localUser,
      token: token
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Verify JWT token and return user information
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded user information or null
 */
function verifyAuthToken(token) {
  return verifyToken(token);
}

/**
 * Get all hypothetical users for testing
 * @param {string} role - Optional role filter
 * @returns {Array} - Array of hypothetical users
 */
function getUsers(role = null) {
  return getHypotheticalUsers(role);
}

/**
 * Check if user has required role
 * @param {object} user - User object
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} - Whether user has required role
 */
function hasRole(user, requiredRoles) {
  if (!user || !user.role) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
}

/**
 * Get user by username from hypothetical data
 * @param {string} username - Username to find
 * @returns {object|null} - User object or null
 */
function getUserByUsername(username) {
  const allUsers = getHypotheticalUsers();
  for (const [role, users] of Object.entries(allUsers)) {
    const user = users.find(u => u.username === username);
    if (user) {
      return { ...user, role };
    }
  }
  return null;
}

/**
 * Create a new local user (for fallback authentication)
 * @param {object} userData - User data
 * @returns {Promise<boolean>} - Success status
 */
async function createLocalUser(userData) {
  try {
    const { username, password, role } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = {
      username,
      passwordHash,
      role: role || 'student'
    };

    users.push(newUser);
    
    // Save updated users to file
    fs.writeFileSync(
      path.join(__dirname, '../users.json'), 
      JSON.stringify(users, null, 2)
    );

    return true;
  } catch (error) {
    console.error('Error creating local user:', error);
    return false;
  }
}

module.exports = { 
  authenticate, 
  verifyAuthToken, 
  getUsers, 
  hasRole, 
  getUserByUsername,
  createLocalUser 
}; 