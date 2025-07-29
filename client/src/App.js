import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import StudentSubmit from './components/StudentSubmit';
import StudentDocuments from './components/StudentDocuments';
import Librarian from './components/Librarian';
import ManualControls from './components/ManualControls';
import AdminDashboard from './components/AdminDashboard';
import Reviewer from './components/Reviewer';
import UploadForm from './components/UploadForm';
import ProgressDemo from './components/ProgressDemo';
import FileUploadDemo from './components/FileUploadDemo';
// import MetadataForm from './components/MetadataForm';
// import Review from './components/Review';
// import Publish from './components/Publish';

/**
 * AppRoutes Component
 * 
 * This component handles the main routing logic for the DSpace Workflow application.
 * It implements a role-based routing system where different user types see different
 * layouts and have access to different pages.
 * 
 * Routing Logic:
 * - Login page: Full-screen layout with no header
 * - Student Submit: Full-screen layout with no header  
 * - Librarian Review: Full-screen layout with no header
 * - Final Approval: Full-screen layout with no header
 * - Admin Dashboard: Standard layout with header
 * - Manual Controls: Standard layout with header
 */
function AppRoutes() {
  const location = useLocation(); // Get current route location
  
  // Check which route is currently active to determine layout
  const isLogin = location.pathname === '/login';
  const isStudentSubmit = location.pathname === '/submit';
  const isLibrarian = location.pathname === '/librarian';
  const isReviewer = location.pathname === '/reviewer';
  
  // Login Page Route - Full screen layout without header
  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  
  // Student Submit Page Route - Full screen layout without header
  if (isStudentSubmit) {
    return (
      <Routes>
        <Route path="/submit" element={<StudentSubmit />} />
        {/* Redirect any unknown routes to student submit */}
        <Route path="*" element={<Navigate to="/submit" />} />
      </Routes>
    );
  }
  
  // Librarian Review Page Route - Full screen layout without header
  if (isLibrarian) {
    return (
      <Routes>
        <Route path="/librarian" element={<Librarian />} />
        {/* Redirect any unknown routes to librarian */}
        <Route path="*" element={<Navigate to="/librarian" />} />
      </Routes>
    );
  }
  
  // Final Approval Page Route - Full screen layout without header
  if (isReviewer) {
    return (
      <Routes>
        <Route path="/reviewer" element={<Reviewer />} />
        {/* Redirect any unknown routes to reviewer */}
        <Route path="*" element={<Navigate to="/reviewer" />} />
      </Routes>
    );
  }
  
  // Standard Layout Routes - These pages have the header and standard layout
  return (
    <>
      <div className="p-6">
        <Routes>
          {/* Student workflow routes */}
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/documents" element={<StudentDocuments />} />
          {/* <Route path="/metadata" element={<MetadataForm />} /> */}
          
          {/* Review and publish routes (commented out - using separate full-screen pages) */}
          {/* <Route path="/review" element={<LibrarianReview />} /> */}
          {/* <Route path="/review/:id" element={<Review />} /> */}
          {/* <Route path="/publish/:id" element={<Publish />} /> */}
          
          {/* Admin and control routes */}
          <Route path="/controls" element={<ManualControls />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/reviewer" element={<Reviewer />} />
          
          {/* Demo routes */}
          <Route path="/demo" element={<ProgressDemo />} />
          <Route path="/upload-demo" element={<FileUploadDemo />} />
          
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

/**
 * Main App Component
 * 
 * This is the root component that wraps the entire application with React Router.
 * It provides the BrowserRouter context for all child components to use navigation.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}