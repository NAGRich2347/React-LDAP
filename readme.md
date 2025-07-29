===== project-root/README.md =====

# DSpace Dissertation Submission System with Windows SSO

## Overview

A comprehensive dissertation submission system that integrates Windows Single Sign-On (SSO) with DSpace for backend management. The system provides role-based access control for students, librarians, reviewers, and administrators with seamless Active Directory integration.

## 🚀 Features

### 🔐 Windows SSO Authentication
- **Active Directory Integration**: Authenticates users against your domain controller
- **Simulation Mode**: For development/testing without AD connection
- **JWT Token Management**: Secure session management
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

## Setup

### 0. **Configure Environment & Execution Policy:**

1. In `server/`, copy `env.example` to `.env` and fill in your DSpace credentials and CORS origin.
2. Ensure DSpace REST API is running (e.g., via Docker at `http://localhost:8080`).
3. **Windows PowerShell users:** if `npm install` fails due to execution policy, run:

    ```powershell
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    ```

    Or, invoke: npm via `npm.cmd install`.

### 1. **Launch Backend:**

```bash
cd server
npm install       # install server dependencies
npm run dev       # start Express proxy on port 3001
```

### 2. **Launch Frontend:**

```bash
cd client
npm install       # install client dependencies
npm start         # start React app on port 3000
```

## Build for Production

**Build for Production:**
To create an optimized production build of the React client:
```bash
cd client
npm run build
```
This outputs static files to `client/build/` which can be served by any static file server or integrated into the Express app.

## Workflow

**Workflow:**
- `/login` → Windows SSO authentication via Active Directory
- `/submit` → document upload and metadata entry
- `/review` → librarian review interface
- `/publish` → finalize and publish items
- Admin routes: `/controls`, `/dashboard`, `/final-approval`

## Hypothetical Users for Testing

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

## Custom UI Implementation

**Custom UI Implementation:**
All page-specific HTML should be implemented in the React components under `client/src/components/`. For each route:

1. Locate the component file matching your page (for example, `Login.js`, `StudentSubmit.js`, etc.).
2. Add the API import at the top of the file, just below the React import. For example:
   ```javascript
   // client/src/components/Login.js
   import React from 'react';
   import api from '../services/api'; // ← API helper import

   export default function Login() {
     // ... your JSX and api calls ...
   }
   ```
3. Replace the placeholder JSX or comments with your actual HTML converted to JSX syntax.
   - Make sure to wrap all elements in a single root element (e.g., `<div>...</div>`).
   - Convert class attributes to className.
   - Update any asset or script paths to use React imports or the public folder as needed.
4. Save and test by navigating to the corresponding route (e.g., `http://localhost:3000/login`).

You can also extract repeated UI elements into reusable components under `client/src/components/` to avoid duplication.

## Windows SSO Configuration

### Active Directory Setup

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

### Environment Variables

Configure your `.env` file with:

```bash
# Active Directory Configuration
AD_SERVER=ldap://your-domain-controller.com
AD_BASE_DN=DC=yourdomain,DC=com
AD_USERNAME=service-account@yourdomain.com
AD_PASSWORD=service-password

# Active Directory Group Mappings
AD_STUDENT_GROUP=CN=Students,OU=Groups,DC=yourdomain,DC=com
AD_LIBRARIAN_GROUP=CN=Librarians,OU=Groups,DC=yourdomain,DC=com
AD_REVIEWER_GROUP=CN=Reviewers,OU=Groups,DC=yourdomain,DC=com
AD_ADMIN_GROUP=CN=Admins,OU=Groups,DC=yourdomain,DC=com
```

## DSpace Integration

### DSpace Setup

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

## Packaging

**Packaging:**
After testing, zip the project:
```bash
cd project-root
zip -r dspace-js-rewrite.zip server client README.md env.example
```
Or distribute via a P2P link (e.g., file.pizza).

## Pushing to GitHub

**Pushing to GitHub:**

1. **Create a GitHub repository** on GitHub.com (e.g., `username/DSpace-JS-Rewrite`).

2. **Initialize Git** in your project root:

```bash
cd project-root
git init
git add .
git commit -m "Initial commit: React + Express DSpace rewrite with Windows SSO"
```

3. **Add the remote** URL (replace `<URL>` with your repo HTTPS or SSH link):

   ```bash
   git remote add origin <URL>
   ```

4. **Push** your code to GitHub:

   ```bash
   git branch -M main
   git push -u origin main
   ```

5. **Verify** on GitHub that your files are online.

> Now any future changes can be committed and pushed via:
>
> ```bash
> git add .
> git commit -m "Your message"
> git push
> ```

## Documentation

For detailed information about the Windows SSO integration, see:
- [Windows SSO Integration Guide](WINDOWS_SSO_INTEGRATION.md)
- [API Documentation](WINDOWS_SSO_INTEGRATION.md#api-endpoints)
- [Troubleshooting Guide](WINDOWS_SSO_INTEGRATION.md#troubleshooting)

## Support

For issues and questions:
1. Check the troubleshooting section in the Windows SSO Integration Guide
2. Review server logs
3. Verify configuration settings
4. Test with hypothetical users first
