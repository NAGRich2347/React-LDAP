// --- StudentDocuments.js ---
// React component for students to view their documents and submissions.
// Students can see documents sent back to them for corrections and their current submissions.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import WorkflowProgress from './WorkflowProgress';

/**
 * StudentDocuments Component - Comprehensive Styling Object
 * 
 * This object contains all the styling for the student documents page.
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
  // Font size selector dropdown styling
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
  // Main container with glass-morphism effect
  container: dark => ({
    background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
    padding: '2.5rem 2rem 2rem 2rem',
    borderRadius: '18px',
    boxShadow: dark
      ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
      : '0 4px 32px rgba(80,40,130,0.10)',
    width: '100%',
    maxWidth: 800,
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
    maxHeight: '80vh',
    overflowY: 'auto',
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
  // Document list container
  documentList: dark => ({
    width: '100%',
    maxWidth: 600,
    marginTop: '1rem',
  }),
  // Individual document item styling
  documentItem: (dark, isSelected) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    marginBottom: '0.5rem',
    background: isSelected ? (dark ? '#4F2683' : '#bbaed6') : (dark ? '#2a1a3a' : '#f9f9f9'),
    border: '1.5px solid #bbaed6',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '1rem',
    color: dark ? '#e0d6f7' : '#201436',
    transition: 'background .3s, border .3s',
    fontWeight: isSelected ? 600 : 400,
  }),
  // Button styling with hover effects
  button: (dark, hover) => ({
    background: hover ? (dark ? '#3d1c6a' : '#bbaed6') : (dark ? '#4F2683' : '#a259e6'),
    color: dark ? '#e0d6f7' : '#fff',
    padding: '.85rem 1.5rem',
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
  // Status badge styling
  statusBadge: (dark, status) => {
    let color = dark ? '#e0d6f7' : '#201436';
    let bgColor = dark ? '#2a1a3a' : '#f9f9f9';
    
    if (status === 'Returned for Corrections') {
      color = '#fff';
      bgColor = '#dc2626';
    } else if (status === 'In Librarian Review') {
      color = '#fff';
      bgColor = '#4F2683';
    } else if (status === 'In Final Review') {
      color = '#fff';
      bgColor = '#f59e0b';
    } else if (status === 'Approved & Published') {
      color = '#fff';
      bgColor = '#059669';
    }
    
    return {
      padding: '0.25rem 0.75rem',
      borderRadius: 12,
      fontSize: '0.8rem',
      fontWeight: 600,
      color,
      background: bgColor,
      border: '1px solid',
      borderColor: color,
    };
  },
  // CSS animations for smooth page transitions
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'none' },
  },
};

/**
 * Helper function to get display filename from submission object
 * 
 * @param {Object} s - Submission object
 * @returns {string} - Formatted filename for display
 */
const getDisplayFilename = (s) => {
  if (!s) return '';
  if (s.filename && s.filename.match(/^.+_.+_Stage\d+\.pdf$/i)) return s.filename;
  let first = s.first || (s.user ? s.user.split('_')[0] : '');
  let last = s.last || (s.user ? s.user.split('_')[1] : '');
  return `${first}_${last}_Stage1.pdf`;
};

/**
 * Helper function to get status text from stage
 * 
 * @param {string} stage - The stage string
 * @returns {string} - Human readable status
 */
const getStatusText = (stage) => {
  switch (stage) {
    case 'Stage0': return 'Returned for Corrections';
    case 'Stage1': return 'In Librarian Review';
    case 'Stage2': return 'In Final Review';
    case 'Stage3': return 'Approved & Published';
    default: return 'Unknown';
  }
};

/**
 * StudentDocuments Component
 * 
 * This component allows students to view their documents and submissions.
 * Students can see:
 * - Documents sent back to them for corrections (Stage0)
 * - Their current submissions in review (Stage1)
 * - Download and preview their documents
 * 
 * Features:
 * - Dark/light theme support
 * - Document download and preview
 * - Status tracking
 * - Responsive design
 * - Notification system integration
 */
export default function StudentDocuments() {
  // UI state management
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px');
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false');
  const [hover, setHover] = useState(false);
  
  // Data state management
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Navigation and utilities
  const navigate = useNavigate();

  // Access control: verify user is authenticated as a student
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || '');
    const exp = +sessionStorage.getItem('expiresAt') || 0;
    if (role !== 'student' || Date.now() > exp) {
      window.alert('Unauthorized');
      navigate('/login');
    }
  }, [navigate]);

  // Persist user preferences to localStorage and apply to document
  useEffect(() => {
    document.documentElement.style.fontSize = fontSize;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('confirmOn', confirmOn);
  }, [dark, fontSize, confirmOn]);

  // Load student's documents from localStorage
  useEffect(() => {
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    // Filter documents for current student (Stage0 - returned documents, Stage1 - in review)
    const studentDocs = allSubmissions.filter(s => 
      s.user === currentUser && (s.stage === 'Stage0' || s.stage === 'Stage1')
    );
    
    // Convert base64 content back to File objects for display
    const processedDocs = studentDocs.map(doc => {
      if (doc.content && !doc.file) {
        try {
          let pdfData = doc.content;
          if (pdfData.startsWith('data:')) {
            pdfData = pdfData.split(',')[1];
          }
          pdfData = pdfData.replace(/\s+/g, '');
          
          const binary = atob(pdfData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const file = new File([blob], doc.filename, { type: 'application/pdf' });
          
          return {
            ...doc,
            file: file,
            content: null
          };
        } catch (error) {
          console.error('Error converting base64 to file:', error);
          return doc;
        }
      }
      return doc;
    });
    
    setDocuments(processedDocs);
  }, []);

  /**
   * Handle user logout by clearing session data and redirecting to login
   */
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  /**
   * Handle opening document from notification system
   */
  const handleOpenDocumentFromNotification = (filename) => {
    const doc = documents.find(d => d.filename === filename);
    if (doc) {
      setSelectedDocument(doc);
    }
  };

  /**
   * Download PDF document
   */
  const downloadPDF = () => {
    if (!selectedDocument) return window.alert('Select a document first');
    
    try {
      if (selectedDocument.file instanceof File) {
        const url = URL.createObjectURL(selectedDocument.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedDocument.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
      
      if (selectedDocument.content) {
        let pdfData = selectedDocument.content;
        if (pdfData.startsWith('data:')) {
          pdfData = pdfData.split(',')[1];
        }
        pdfData = pdfData.replace(/\s+/g, '');
        
        const binary = atob(pdfData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedDocument.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      window.alert('Error downloading PDF. Please try again.');
    }
  };

  /**
   * Preview PDF in new tab
   */
  const previewPDF = () => {
    if (!selectedDocument) return window.alert('Select a document first');
    
    try {
      if (selectedDocument.file instanceof File) {
        const url = URL.createObjectURL(selectedDocument.file);
        window.open(url, '_blank');
        return;
      }
      
      if (selectedDocument.content) {
        let pdfData = selectedDocument.content;
        if (pdfData.startsWith('data:')) {
          pdfData = pdfData.split(',')[1];
        }
        pdfData = pdfData.replace(/\s+/g, '');
        
        const dataUrl = `data:application/pdf;base64,${pdfData}`;
        window.open(dataUrl, '_blank');
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      window.alert('Error previewing PDF. Please try again.');
    }
  };

  /**
   * Select a document for viewing
   */
  const selectDocument = (doc) => {
    if (confirmOn && !window.confirm('Select this document?')) return;
    setSelectedDocument(doc);
  };

  return (
    <div style={{ ...styles.body(dark, fontSize) }}>
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
        marginBottom: '2.5rem',
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
      
      {/* Main Container */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>My Documents</h1>
        
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ color: dark ? '#e0d6f7' : '#201436', marginBottom: '1rem' }}>
              No documents found
            </h3>
            <p style={{ color: dark ? '#bbaed6' : '#666' }}>
              You haven't submitted any documents yet, or no documents have been returned to you.
            </p>
            <button
              onClick={() => navigate('/submit')}
              style={styles.button(dark, hover)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              📝 Submit New Document
            </button>
          </div>
        ) : (
          <>
            <div style={styles.documentList(dark)}>
              {documents.map((doc, index) => (
                <div
                  key={index}
                  style={styles.documentItem(dark, selectedDocument?.filename === doc.filename)}
                  onClick={() => selectDocument(doc)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {getDisplayFilename(doc)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: dark ? '#bbaed6' : '#666' }}>
                      Submitted: {new Date(doc.time).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.statusBadge(dark, getStatusText(doc.stage))}>
                    {getStatusText(doc.stage)}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedDocument && (
              <div style={{ marginTop: '2rem', width: '100%' }}>
                <h3 style={{ color: dark ? '#e0d6f7' : '#201436', marginBottom: '1rem' }}>
                  Selected: {getDisplayFilename(selectedDocument)}
                </h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={downloadPDF}
                    style={styles.button(dark, hover)}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={previewPDF}
                    style={styles.button(dark, hover)}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                  >
                    👁️ Preview PDF
                  </button>
                  {selectedDocument.stage === 'Stage0' && (
                    <button
                      onClick={() => navigate('/submit')}
                      style={styles.button(dark, hover)}
                      onMouseEnter={() => setHover(true)}
                      onMouseLeave={() => setHover(false)}
                    >
                      📝 Resubmit
                    </button>
                  )}
                </div>
                {selectedDocument.notes && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
                    borderRadius: 8,
                    border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
                    textAlign: 'left'
                  }}>
                    <strong style={{ color: dark ? '#e0d6f7' : '#201436' }}>Notes:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: dark ? '#bbaed6' : '#666' }}>
                      {selectedDocument.notes}
                    </p>
                  </div>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <WorkflowProgress 
                    currentStage={selectedDocument.stage}
                    status={getStatusText(selectedDocument.stage)}
                    dark={dark}
                    showTimeline={true}
                  />
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => navigate('/submit')}
                style={styles.button(dark, hover)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                📝 Submit New Document
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 