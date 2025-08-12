# Windows SSO Integration with DSpace

## Overview

This system integrates Windows Single Sign-On (SSO) with DSpace for dissertation submission management. It provides seamless authentication through Active Directory and role-based access control for students, librarians, reviewers, and administrators.

## Features

### 🔐 Windows SSO Authentication
- **Active Directory Integration**: Authenticates users against your domain controller
- **Simulation Mode**: For development/testing without AD connection
- **JWT Token Management**: Secure session management with JSON Web Tokens
- **Fallback Authentication**: Local user database for testing

### 🎭 Role Delegation
- **Student Role**: Submit dissertations, view own submissions
- **Librarian Role**: Review submissions, manage collections
- **Reviewer Role**: Technical review of submissions
- **Admin Role**: System administration, user management

### 📚 DSpace Integration
- **Latest DSpace API**: Compatible with DSpace 7.x
- **Automatic User Creation**: Creates DSpace epersons for Windows users
- **Group Assignment**: Maps Windows groups to DSpace groups
- **Workflow Integration**: Full submission workflow support

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Express API    │    │   DSpace 7.x    │
│   (React)       │◄──►│   (Node.js)      │◄──►│   Repository    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ Active Directory │
                       │   (Windows)      │
                       └──────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Copy `server/env.example` to `server/.env` and configure:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# DSpace Configuration
DSPACE_URL=http://localhost:8080
DSPACE_USERNAME=dspace@dspace.org
DSPACE_PASSWORD=dspace

# Active Directory Configuration
AD_SERVER=ldap://your-domain-controller.com
AD_BASE_DN=DC=yourdomain,DC=com
AD_USERNAME=service-account@yourdomain.com
AD_PASSWORD=service-password
AD_DOMAIN=yourdomain.com

# Active Directory Group Mappings
AD_STUDENT_GROUP=CN=Students,OU=Groups,DC=yourdomain,DC=com
AD_LIBRARIAN_GROUP=CN=Librarians,OU=Groups,DC=yourdomain,DC=com
AD_REVIEWER_GROUP=CN=Reviewers,OU=Groups,DC=yourdomain,DC=com
AD_ADMIN_GROUP=CN=Admins,OU=Groups,DC=yourdomain,DC=com
```

### 2. Install Dependencies

```bash
cd server
npm install
```

### 3. DSpace Setup

1. **Install DSpace 7.x**:
   ```bash
   # Using Docker (recommended)
   docker run -d --name dspace \
     -p 8080:8080 \
     -e DSPACE_DB_HOST=postgres \
     -e DSPACE_DB_NAME=dspace \
     -e DSPACE_DB_USERNAME=dspace \
     -e DSPACE_DB_PASSWORD=dspace \
     dspace/dspace:7.6
   ```

2. **Create Required Groups**:
   - Students
   - Librarians
   - Reviewers
   - Administrators
   - Dissertation_Submitters
   - Dissertation_Reviewers
   - Collection_Managers
   - System_Administrators

### 4. Active Directory Configuration

1. **Create Service Account**:
   - Username: `dspace-service@yourdomain.com`
   - Password: Secure password
   - Permissions: Read access to user attributes and group membership

2. **Configure Group Structure**:
   ```
   OU=Groups,DC=yourdomain,DC=com
   ├── CN=Students
   ├── CN=Librarians
   ├── CN=Reviewers
   └── CN=Admins
   ```

3. **Add Users to Groups**:
   - Students: Add student usernames
   - Librarians: Add librarian usernames
   - Reviewers: Add reviewer usernames
   - Admins: Add administrator usernames

### 5. Windows Integrated Authentication (SSPI)

Optionally enable SSPI for true Single Sign-On when clients and server are joined to the same domain and browsers are configured for Integrated Authentication.

1. In `server/.env` set:
   ```
   ENABLE_SSPI=true
   AD_DOMAIN=yourdomain.com
   ```
2. Ensure the server runs on Windows and is joined to the domain.
3. Configure browser to allow Negotiate/NTLM for your server URL.
4. Call `GET /api/submissions/auth/sso` from the client to obtain a JWT.

## Hypothetical Users

The system includes pre-generated hypothetical users for testing:

### Students
- `john.smith` - John Smith (S2024001)
- `sarah.jones` - Sarah Jones (S2024002)
- `michael.brown` - Michael Brown (S2024003)
- `emily.davis` - Emily Davis (S2024004)
- `david.wilson` - David Wilson (S2024005)

### Librarians
- `dr.martinez` - Dr. Maria Martinez (Library Sciences)
- `prof.thompson` - Prof. Robert Thompson (Digital Archives)
- `ms.chen` - Ms. Lisa Chen (Research Support)

### Reviewers
- `dr.anderson` - Dr. James Anderson (Computer Science)
- `prof.garcia` - Prof. Elena Garcia (Information Systems)
- `dr.kumar` - Dr. Rajesh Kumar (Data Science)

### Administrators
- `admin.rodriguez` - Admin Carlos Rodriguez (System Administrator)
- `admin.patel` - Admin Priya Patel (IT Manager)

## API Endpoints

### Authentication
```
POST /api/submissions/auth/login
POST /api/submissions/auth/logout
GET  /api/submissions/auth/me
```

### User Management
```
GET /api/submissions/users
GET /api/submissions/users/:username
```

### Submissions
```
POST /api/submissions/submit
GET  /api/submissions/my-submissions
GET  /api/submissions/submissions/review
```

### File Upload
```
POST /api/submissions/upload
```

### Dashboards
```
GET /api/submissions/dashboard/student
GET /api/submissions/dashboard/librarian
GET /api/submissions/dashboard/reviewer
GET /api/submissions/dashboard/admin
```

## Authentication Flow

### Windows SSO Flow
1. User submits credentials
2. System authenticates against Active Directory
3. User groups are retrieved from AD
4. Role is determined based on group membership
5. JWT token is generated and returned
6. User is automatically created/updated in DSpace

### Development Mode
1. User submits credentials
2. System checks against hypothetical user database
3. Role is assigned based on predefined mappings
4. JWT token is generated and returned
5. Simulated DSpace integration

## Role Permissions

### Student
- Submit dissertations
- View own submissions
- Upload files
- Edit submission metadata

### Librarian
- Review all submissions
- Approve/reject submissions
- Manage collections
- View submission statistics

### Reviewer
- Technical review of submissions
- Provide feedback
- View assigned submissions
- Update review status

### Administrator
- User management
- System configuration
- View all submissions
- Manage roles and permissions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Sanitized user inputs
- **File Upload Security**: Type and size restrictions
- **CORS Protection**: Configured cross-origin requests
- **Helmet Security**: HTTP security headers

## Development vs Production

### Development Mode
- Uses hypothetical user database
- Simulates Windows authentication
- No Active Directory connection required
- Easy testing and development

### Production Mode
- Real Active Directory authentication
- Live DSpace integration
- Secure JWT tokens
- Production-grade security

## Troubleshooting

### Common Issues

1. **AD Connection Failed**:
   - Check AD server URL and credentials
   - Verify network connectivity
   - Ensure service account has proper permissions

2. **DSpace Integration Issues**:
   - Verify DSpace is running
   - Check DSpace API version compatibility
   - Ensure DSpace groups exist

3. **JWT Token Issues**:
   - Check JWT_SECRET configuration
   - Verify token expiration settings
   - Clear browser storage if needed

### Logs
- Server logs: `npm run dev` output
- Authentication logs: Check console for auth errors
- DSpace logs: Check DSpace application logs

## Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Use hypothetical users for authentication
3. Test each role's permissions
4. Verify DSpace integration

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3001/api/submissions/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.smith","password":"password"}'

# Test protected endpoint
curl -X GET http://localhost:3001/api/submissions/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Production Checklist
- [ ] Configure production environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database
- [ ] Set up monitoring and logging
- [ ] Test Active Directory integration
- [ ] Verify DSpace production instance
- [ ] Configure backup procedures

### Docker Deployment
```bash
# Build and run with Docker
docker build -t dspace-integration .
docker run -d -p 3001:3001 --env-file .env dspace-integration
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Verify configuration settings
4. Test with hypothetical users first

## License

This integration is part of the DSpace Dissertation Submission System. 