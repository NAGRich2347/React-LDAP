import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import WorkflowProgress from './WorkflowProgress';
import FileUpload from './FileUpload';

/**
 * StudentSubmit Component - Comprehensive Styling Object
 * 
 * This object contains all the styling for the student submission page.
 * Each style function takes theme parameters (dark/light mode) and returns
 * appropriate CSS properties for responsive, accessible design.
 */
const styles = {
  // Full-screen background with gradient based on theme
  body: (dark, fontSize) => ({
    fontFamily: "'BentonSans Book', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    minHeight: 0,
    minWidth: 0,
    margin: 0,
    padding: 0,
    background: dark
      ? 'radial-gradient(ellipse at 50% 40%, #231942 0%, #4F2683 80%, #18122b 100%)'
      : 'radial-gradient(ellipse at 50% 40%, #fff 0%, #e9e6f7 80%, #cfc6e6 100%)',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'background .3s,color .3s',
    fontSize,
    boxSizing: 'border-box',
    overflow: 'hidden',
    outline: 'none',
  }),
  // Settings bar positioned in top-right corner for theme and font controls
  settingsBar: {
    position: 'fixed',
    top: 15,
    right: 20,
    display: 'flex',
    gap: '1rem',
    zIndex: 1000,
    alignItems: 'center',
  },
  // Dark/light mode toggle slider styling
  slider: dark => ({
    position: 'relative',
    width: 50,
    height: 24,
    borderRadius: 24,
    background: dark ? '#4F2683' : '#e9e6f7',
    border: '1.5px solid #bbaed6',
    transition: '.4s',
    display: 'inline-block',
    marginLeft: 4,
    marginRight: 4,
    boxSizing: 'border-box',
  }),
  // Slider button (sun/moon icon) styling with smooth transitions
  sliderBefore: dark => ({
    content: dark ? '"🌙"' : '"☀"',
    position: 'absolute',
    width: 18,
    height: 18,
    left: dark ? 29 : 3,
    bottom: 3,
    background: dark ? '#231942' : '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '.4s',
    color: dark ? '#e0d6f7' : '#4F2683',
    fontSize: 14,
    textAlign: 'center',
    border: '1.5px solid #bbaed6',
    boxSizing: 'border-box',
  }),
  // Main form container with glass-morphism effect
  container: dark => ({
    background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
    padding: '2.5rem 2rem 2rem 2rem',
    borderRadius: '18px',
    boxShadow: dark
      ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
      : '0 4px 32px rgba(80,40,130,0.10)',
    width: '100%',
    maxWidth: 500,
    minWidth: 0,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn .7s',
    transition: 'background .3s,color .3s',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    overflow: 'visible',
    textAlign: 'center',
  }),
  // Main heading styling with bold font and proper spacing
  h1: dark => ({
    fontFamily: "'BentonSans Bold'",
    color: dark ? '#e0d6f7' : '#201436',
    fontSize: '2rem',
    marginBottom: '1.5rem',
    letterSpacing: '-1px',
    transition: 'color .3s',
  }),
  // Text input styling with error state support
  input: (dark, hasError) => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: hasError ? (dark ? '2px solid #a259e6' : '2px solid #a259e6') : (dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6'),
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  // File input styling with consistent theme support
  fileInput: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  }),
  // Textarea styling for notes/comments
  textarea: dark => ({
    width: '100%',
    padding: '.85rem 1rem',
    margin: '.5rem 0',
    border: dark ? '1.5px solid #4F2683' : '1.5px solid #bbaed6',
    borderRadius: 6,
    fontFamily: "'BentonSans Book'",
    fontSize: '1.08rem',
    background: dark ? '#2a1a3a' : '#f9f9f9',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'border .2s, background .3s, color .3s',
    boxSizing: 'border-box',
    outline: 'none',
  }),
  // Dropdown select styling with custom appearance
  select: dark => ({
    padding: '0.4rem 1.2rem 0.4rem 0.6rem',
    borderRadius: 6,
    border: '1.5px solid #bbaed6',
    background: dark ? '#2a1a3a' : '#fff',
    color: dark ? '#e0d6f7' : '#201436',
    fontFamily: "'BentonSans Book'",
    fontSize: '1rem',
    outline: 'none',
    transition: 'background .3s,color .3s',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
  }),
  // Button styling with hover effects and loading states
  button: (dark, hover) => ({
    padding: '.85rem 1.5rem',
    background: hover ? (dark ? '#3d1c6a' : '#bbaed6') : (dark ? '#4F2683' : '#a259e6'),
    color: dark ? '#e0d6f7' : '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'BentonSans Book'",
    fontWeight: 600,
    fontSize: '1.1rem',
    marginTop: 8,
    boxShadow: dark
      ? '0 2px 8px rgba(79,38,131,0.25)'
      : '0 2px 8px rgba(80,40,130,0.08)',
    transition: 'background .3s',
    outline: 'none',
  }),
  // Success/alert message styling
  alert: dark => ({
    marginTop: '1rem',
    color: dark ? '#b6f7b6' : 'green',
    display: 'block',
    fontWeight: 500,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
    minHeight: 24,
    textAlign: 'center',
    transition: 'color .3s',
  }),
  // CSS animations for smooth page transitions
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
};

/**
 * StudentSubmit Component
 * 
 * This component handles the student PDF submission workflow. Students can:
 * - Enter their first and last name
 * - Upload a PDF file (with validation)
 * - Add optional notes
 * - Submit their work for review
 * 
 * Features:
 * - Dark/light theme support
 * - File validation (type, size)
 * - Input sanitization for security
 * - Responsive design
 * - Accessibility features
 * - Notification system integration
 */
export default function StudentSubmit() {
  // Form state management
  const [first, setFirst] = useState(''); // Student's first name
  const [last, setLast] = useState(''); // Student's last name
  const [files, setFiles] = useState([]); // Selected PDF files (now supports multiple)
  const [notes, setNotes] = useState(''); // Optional notes/comments
  const [alert, setAlert] = useState(''); // Success/error messages
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); // Theme preference
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px'); // Font size preference
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false'); // Confirmation dialog preference
  const [hover, setHover] = useState(false); // Button hover state for visual feedback
  const [showProgress, setShowProgress] = useState(false); // Show progress after submission
  const [submittedDocument, setSubmittedDocument] = useState(null); // Store submitted document info
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const navigate = useNavigate(); // React Router navigation hook

  // Real-time validation feedback
  const validateFirst = (val) => {
    if (!val) return 'First name is required.';
    if (val.length < 2) return 'First name must be at least 2 characters.';
    return '';
  };
  const validateLast = (val) => {
    if (!val) return 'Last name is required.';
    if (val.length < 2) return 'Last name must be at least 2 characters.';
    return '';
  };
  const validateFiles = (arr) => {
    if (!arr || arr.length === 0) return 'Please select at least one PDF file.';
    return '';
  };
  const firstError = submitAttempted ? validateFirst(first) : '';
  const lastError = submitAttempted ? validateLast(last) : '';
  const filesError = submitAttempted ? validateFiles(files) : '';

  // Access control: verify user is authenticated as a student
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || ''); // Decode role from base64
    const exp = +sessionStorage.getItem('expiresAt') || 0; // Get session expiration time
    if (role !== 'student' || Date.now() > exp) {
      window.alert('Unauthorized'); // Show error if not student or session expired
      navigate('/login'); // Redirect to login page
    }
  }, [navigate]);

  // Persist user preferences to localStorage and apply to document
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize; // Apply font size to document
    localStorage.setItem('theme', dark ? 'dark' : 'light'); // Save theme preference
    localStorage.setItem('fontSize', fontSize); // Save font size preference
    localStorage.setItem('confirmOn', confirmOn); // Save confirmation dialog preference
  }, [dark, fontSize, confirmOn]);

  /**
   * Sanitize input to prevent XSS (Cross-Site Scripting) attacks
   * 
   * This function removes potentially dangerous HTML tags, attributes, and JavaScript
   * from user input to ensure security when displaying content.
   * 
   * @param {string} input - The user input to sanitize
   * @returns {string} - Sanitized input with dangerous content removed
   */
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return ''; // Return empty string for non-string inputs
    
    // Remove potentially dangerous HTML tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '') // Remove form tags
      .replace(/<input\b[^>]*>/gi, '') // Remove input tags
      .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '') // Remove textarea tags
      .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '') // Remove select tags
      .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '') // Remove button tags
      .replace(/<link\b[^>]*>/gi, '') // Remove link tags
      .replace(/<meta\b[^>]*>/gi, '') // Remove meta tags
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .replace(/eval\s*\(/gi, '') // Remove eval() calls
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .trim(); // Remove leading/trailing whitespace
  };

  /**
   * Validate file size to prevent oversized uploads
   * 
   * @param {File} file - The file to validate
   * @param {number} maxSizeMB - Maximum file size in megabytes (default: 10MB)
   * @returns {boolean} - True if file size is acceptable, false otherwise
   */
  const validateFileSize = (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      window.alert(`File size must be under ${maxSizeMB}MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    return true;
  };

  /**
   * Validate file type to ensure only PDFs are uploaded
   * 
   * @param {File} file - The file to validate
   * @returns {boolean} - True if file is a PDF, false otherwise
   */
  const validateFileType = (file) => {
    if (file.type !== 'application/pdf') {
      window.alert('Please select a PDF file');
      return false;
    }
    return true;
  };

  /**
   * Normalize names by converting spaces to underscores and making lowercase
   * 
   * @param {string} name - The name to normalize
   * @returns {string} Normalized name with underscores and lowercase
   */
  const normalizeName = (name) => {
    // First replace multiple spaces with single underscores, then trim and lowercase
    return name.replace(/\s+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  };

  /**
   * Utility to auto-rename the uploaded file to the required format
   * @param {string} first - Student's first name
   * @param {string} last - Student's last name
   * @param {string} stage - Stage string (e.g., 'Stage1')
   * @returns {string} - Properly formatted filename
   */
  const autoRenameFile = (first, last, stage) => {
    const normalizedFirst = normalizeName(first);
    const normalizedLast = normalizeName(last);
    return `${normalizedFirst}_${normalizedLast}_${stage}.pdf`;
  };

  /**
   * Handle form submission for student PDF uploads
   * 
   * This function validates the form data, checks submission limits,
   * converts the file to base64 for storage, and saves the submission
   * to both user-specific and global localStorage.
   */
  const handleSubmit = async () => {
    setSubmitAttempted(true);
    setAlert('');
    setRetry(false);
    if (validateFirst(first) || validateLast(last) || validateFiles(files)) {
      setAlert('Please fix the errors above and try again.');
      return;
    }
    setLoading(true);
    try {
      // Validate that all required fields are filled
      const normalizedFirst = normalizeName(first);
      const normalizedLast = normalizeName(last);
      
      if (!normalizedFirst || !normalizedLast) {
        window.alert('Please enter both first and last name');
        return;
      }
      
      if (files.length === 0) {
        window.alert('Please select at least one PDF file');
        return;
      }
      
      // Validate all files
      for (const file of files) {
        if (!validateFileType(file)) {
          return;
        }
        if (!validateFileSize(file)) {
          return;
        }
      }
      
      // Show confirmation dialog if enabled
      if (confirmOn && !window.confirm(`Submit ${files.length} file(s)?`)) return;
      
      // Process each file
      const submissions = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const suffix = files.length > 1 ? `_${i + 1}` : '';
        const expectedFilename = `${normalizedFirst}_${normalizedLast}_Stage1.pdf` + suffix;
        const renamedFile = new File([file], expectedFilename, { type: 'application/pdf' });
      
      // Show confirmation dialog if enabled
      if (confirmOn && !window.confirm('Submit now?')) return;
      
      // Get current user for tracking
      const user = atob(sessionStorage.getItem('authUser') || ''); // Decode username
      const key = `submissions_${user}`; // User-specific storage key
      const arr = JSON.parse(localStorage.getItem(key) || '[]'); // Get user's submissions
      
        // Convert File object to base64 string for localStorage storage
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 data
          reader.readAsDataURL(renamedFile);
        });
        
        // Trim notes and treat as empty if only spaces
        const trimmedNotes = notes.trim();
        // Create submission object with both File and base64 content
        const submission = {
          filename: expectedFilename,
          file: renamedFile, // Use renamed File object
          content: base64, // Store base64 for localStorage persistence
          notes: trimmedNotes ? sanitizeInput(trimmedNotes) : '', // Sanitize notes, treat empty if only spaces
          time: Date.now(),
          stage: 'Stage1',
          user: atob(sessionStorage.getItem('authUser') || '')
        };
        
        submissions.push(submission);
      }
      
      // Get current user for tracking
      const user = atob(sessionStorage.getItem('authUser') || ''); // Decode username
      const key = `submissions_${user}`; // User-specific storage key
      const arr = JSON.parse(localStorage.getItem(key) || '[]'); // Get user's submissions
      
      // Save all submissions to user-specific storage
      arr.push(...submissions);
      localStorage.setItem(key, JSON.stringify(arr));
      
      // Save to global submissions list for reviewers to access
      const all = JSON.parse(localStorage.getItem('submissions') || '[]');
      const serializableSubmissions = submissions.map(submission => ({
        ...submission,
        file: null, // Remove File object for JSON serialization
      }));
      all.push(...serializableSubmissions);
      localStorage.setItem('submissions', JSON.stringify(all));
      
      // Store submitted document info for progress display (show first file)
      setSubmittedDocument({
        filename: submissions[0].filename,
        stage: 'Stage0',
        status: 'Pending'
      });
      
      // Show progress view
      setShowProgress(true);
      
      // Show success message and reset form
      setAlert(`Successfully submitted ${submissions.length} file(s)!`);
      setTimeout(() => setAlert(''), 10000); // Clear alert after 10 seconds
      setFirst(''); // Clear first name
      setLast(''); // Clear last name
      setFiles([]); // Clear file selection
      setNotes(''); // Clear notes
    } catch (err) {
      setAlert('Submission failed. Please check your internet connection or try again.');
      setRetry(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout by clearing session data and redirecting to login
   */
  const handleLogout = () => {
    sessionStorage.clear(); // Clear all session storage (auth data, etc.)
    navigate('/login'); // Redirect to login page
  };

  /**
   * Handle opening document from notification system
   * 
   * For students, this shows a message when their document has been
   * returned by a reviewer for corrections.
   * 
   * @param {string} filename - The name of the returned document
   */
  const handleOpenDocumentFromNotification = (filename) => {
    // For students, navigate to documents page to see returned document
    window.alert(`Document ${filename} has been returned to you. Please review and resubmit if needed.`);
    navigate('/documents');
  };

  const handleRetry = () => {
    setRetry(false);
    setAlert('');
    setLoading(false);
    setSubmitAttempted(false);
  };

  return (
    <div style={{ ...styles.body(dark, fontSize), flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NotificationSystem 
        dark={dark} 
        onOpenDocument={handleOpenDocumentFromNotification}
      />
      {/* Global style to force fullscreen, no scrollbars, no white edges */}
      <style>{`
        html, body, #root {
          width: 100vw !important;
          height: 100vh !important;
          min-width: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: none !important;
          box-sizing: border-box !important;
        }
        body::-webkit-scrollbar, html::-webkit-scrollbar {
          display: none !important;
        }
        input[type='file']::file-selector-button {
          padding: 0.4rem 1.2rem;
          border-radius: 6px;
          border: 1.5px solid #bbaed6;
          background: ${dark ? '#2a1a3a' : '#fff'};
          color: ${dark ? '#e0d6f7' : '#201436'};
          font-family: 'BentonSans Book', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background .3s, color .3s, border-color .3s;
        }
        input[type='file']::-webkit-file-upload-button {
          padding: 0.4rem 1.2rem;
          border-radius: 6px;
          border: 1.5px solid #bbaed6;
          background: ${dark ? '#2a1a3a' : '#fff'};
          color: ${dark ? '#e0d6f7' : '#201436'};
          font-family: 'BentonSans Book', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background .3s, color .3s, border-color .3s;
        }
      `}</style>
      {/* Settings Bar */}
      <div style={{
        position: 'fixed',
        top: 18,
        right: 28,
        zIndex: 2001,
        background: dark ? 'rgba(36,18,54,0.98)' : '#f7fafc',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: '2.5rem', // Add vertical space below the bar
      }}>
        <label htmlFor="darkModeToggle" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            id="darkModeToggle"
            name="darkMode"
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
            style={{ display: 'none' }}
          />
          <span style={styles.slider(dark)}>
            <span style={styles.sliderBefore(dark)}>{dark ? '🌙' : '☀'}</span>
          </span>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Dark Mode</span>
        </label>
        <label htmlFor="fontSizeSelect" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>Font Size</span>
          <select
            id="fontSizeSelect"
            name="fontSize"
            value={fontSize}
            onChange={e => setFontSize(e.target.value)}
            style={styles.select(dark)}
          >
            <option value="14px">Default</option>
            <option value="16px">Large</option>
            <option value="12px">Small</option>
          </select>
        </label>
        <label htmlFor="confirmToggle" style={{ display: 'flex', alignItems: 'center', gap: 8, color: dark ? '#e0d6f7' : '#201436', fontWeight: 500 }}>
          <input
            id="confirmToggle"
            name="confirmOn"
            type="checkbox"
            checked={confirmOn}
            onChange={e => setConfirmOn(e.target.checked)}
          />
          Confirm
        </label>
        <button onClick={handleLogout} style={styles.button(dark, hover)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>Logout</button>
      </div>
      {/* Main Form or Progress View */}
      <div style={{ ...styles.container(dark), maxWidth: 500, width: '100%', margin: 'auto', borderRadius: 18, boxShadow: dark ? '0 8px 40px 0 rgba(79,38,131,0.25)' : '0 4px 32px rgba(80,40,130,0.10)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {showProgress && submittedDocument ? (
          <>
            <h1 style={styles.h1(dark)}>Documents Submitted!</h1>
            <WorkflowProgress 
              currentStage={submittedDocument.stage}
              status={submittedDocument.status}
              dark={dark}
              showTimeline={true}
            />
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setShowProgress(false);
                  setSubmittedDocument(null);
                }}
                style={styles.button(dark, hover)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                📝 Submit More Documents
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={styles.h1(dark)}>Submit Dissertation</h1>
            <div style={{ width: '100%', maxWidth: 400 }}>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                value={first}
                onChange={e => setFirst(e.target.value)}
                style={styles.input(dark, !!firstError)}
                aria-label="First Name"
                aria-invalid={!!firstError}
                aria-describedby={firstError ? 'first-error' : undefined}
                onBlur={() => setSubmitAttempted(true)}
                className="mb-2 w-full rounded px-3 py-2 text-base"
              />
              {firstError && <div id="first-error" style={{ color: 'red', fontSize: '0.95rem', marginBottom: 4 }}>{firstError}</div>}
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={last}
                onChange={e => setLast(e.target.value)}
                style={styles.input(dark, !!lastError)}
                aria-label="Last Name"
                aria-invalid={!!lastError}
                aria-describedby={lastError ? 'last-error' : undefined}
                onBlur={() => setSubmitAttempted(true)}
                className="mb-2 w-full rounded px-3 py-2 text-base"
              />
              {lastError && <div id="last-error" style={{ color: 'red', fontSize: '0.95rem', marginBottom: 4 }}>{lastError}</div>}
              <FileUpload
                files={files}
                onFilesChange={setFiles}
                dark={dark}
                multiple={true}
                maxFiles={5}
                maxSizeMB={10}
              />
              {filesError && <div style={{ color: 'red', fontSize: '0.95rem', marginBottom: 4 }}>{filesError}</div>}
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={styles.textarea(dark)}
                aria-label="Notes (optional)"
                className="mb-2 w-full rounded px-3 py-2 text-base"
              />
              {/* Alert/Error/Success Message */}
              {alert && (
                <div style={{ color: alert.includes('success') ? 'green' : 'red', fontWeight: 500, marginBottom: 8 }} aria-live="assertive" role="alert">
                  {alert}
                  {alert.includes('internet') && <div>Tip: Check your connection or try again later.</div>}
                </div>
              )}
              {/* Loading/progress indicator */}
              {loading && (
                <div style={{ width: '100%', margin: '8px 0' }}>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div className="bg-blue-600 h-2 rounded" style={{ width: '100%', transition: 'width 0.3s' }} role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 12, color: dark ? '#bbaed6' : '#4F2683', marginTop: 2 }}>Submitting...</div>
                </div>
              )}
              {/* Submit and Retry Buttons */}
              <button
                onClick={handleSubmit}
                style={{ ...styles.button(dark, hover), width: '100%', fontSize: 18, padding: '1rem', marginTop: 8, borderRadius: 10, touchAction: 'manipulation' }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                disabled={loading || files.length === 0}
                aria-busy={loading}
                aria-label="Submit Dissertation"
                className="mb-2"
              >
                {loading ? 'Submitting...' : `Submit${files.length > 0 ? ` (${files.length} file${files.length > 1 ? 's' : ''})` : ''}`}
              </button>
              {retry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{ ...styles.button(dark, false), background: '#f1c40f', color: '#201436', width: '100%', fontSize: 18, padding: '1rem', borderRadius: 10, marginTop: 4, touchAction: 'manipulation' }}
                  aria-label="Retry submission"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => navigate('/documents')}
                style={{ ...styles.button(dark, hover), width: '100%', fontSize: 18, padding: '1rem', borderRadius: 10, marginTop: 8, touchAction: 'manipulation' }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                aria-label="View My Documents"
                className="mb-2"
              >
                📄 View My Documents
              </button>
            </div>
          </>
        )}
      </div>
      {/* Mobile & accessibility tips (now below the form, centered horizontally) */}
      <div className="mt-4 text-xs text-gray-500" aria-live="polite" style={{ textAlign: 'center', marginTop: 24, maxWidth: 400, width: '100%' }}>
        <div>Optimized for mobile and desktop. Use keyboard navigation to tab through fields.</div>
        <div>Touch-friendly buttons. Screen reader friendly. All errors and progress are announced.</div>
      </div>
    </div>
  );
}