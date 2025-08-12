// Entry point for Express server with custom dissertation submission backend
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes/submissions');
const { errorHandler } = require('./middleware/errorHandler');
const fileUpload = require('express-fileupload');
require('dotenv').config();
let sspi;
if (process.env.ENABLE_SSPI === 'true') {
  // Conditionally load SSPI to avoid non-Windows build/runtime issues
  // eslint-disable-next-line global-require
  sspi = require('node-expose-sspi');
}
const { generateToken, determineUserRole, getUserGroupsFromAD } = require('./services/windowsAuthService');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers and CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  credentials: true 
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session for authentication
app.use(
  session({
    name: 'DissertationSession',
    secret: process.env.SESSION_SECRET || 'devsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// File upload middleware (handles multipart/form-data securely)
app.use(fileUpload({
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB limit
  },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  useTempFiles: true,
  tempFileDir: os.tmpdir()
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/submissions', routes);

// Optional Windows Integrated Authentication endpoint (Kerberos/NTLM)
// When client and server are in the same AD domain and browser is configured to allow
// integrated auth, this endpoint returns a JWT derived from the negotiated identity.
if (process.env.ENABLE_SSPI === 'true') {
  app.use(sspi());

  app.get('/api/submissions/auth/sso', async (req, res) => {
    try {
      if (!req.sspi || !req.sspi.user) {
        return res.status(401).json({ error: 'SSPI user not available' });
      }
      const accountName = req.sspi.user.displayName || req.sspi.user.name || req.sspi.user.login || req.sspi.user.upn;
      const samOrUpn = req.sspi.user.login || req.sspi.user.upn || accountName;
      const groups = await getUserGroupsFromAD(samOrUpn);
      const role = determineUserRole(groups);
      const user = {
        username: req.sspi.user.login || req.sspi.user.upn || accountName,
        displayName: accountName,
        email: req.sspi.user.mail || req.sspi.user.upn || '',
        role,
        groups: groups.map(g => (typeof g === 'string' ? g : g.cn || g.dn || ''))
      };
      const token = generateToken(user);
      res.json({ success: true, user, token });
    } catch (err) {
      console.error('SSPI SSO error:', err);
      res.status(500).json({ error: 'SSO failed' });
    }
  });
}

// Root endpoint with system information
app.get('/', (req, res) => {
  res.json({
    message: 'Dissertation Submission System',
    version: '1.0.0',
    features: {
      windowsSSO: true,
      customBackend: true,
      roleDelegation: true,
      jwtAuthentication: true,
      fileUpload: true
    },
    endpoints: {
      health: '/api/submissions/health',
      auth: '/api/submissions/auth',
      submissions: '/api/submissions/submit',
      users: '/api/submissions/users',
      dashboard: '/api/submissions/dashboard'
    },
    documentation: 'See README.md for API documentation'
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dissertation Submission Server running on port ${PORT}`);
  console.log(`📚 Windows SSO Authentication: ${process.env.NODE_ENV === 'development' ? 'Simulation Mode' : 'Active Directory Mode'}`);
  console.log(`💾 Custom Backend: Local JSON storage`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🔐 JWT Authentication: Enabled`);
  console.log(`📁 File Upload: Enabled (max ${process.env.MAX_FILE_SIZE || '10MB'})`);
  console.log(`🌍 Server accessible at: http://localhost:${PORT}`);
});