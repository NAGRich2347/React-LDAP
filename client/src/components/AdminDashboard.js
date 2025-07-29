// --- AdminDashboard.js ---
// React component for the admin dashboard of the workflow system.
// Provides overview of all submissions, admin logs, and system management tools.
// Admins can view submission history, add sample data, and monitor workflow progress.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowProgress from './WorkflowProgress';

function generateICS({ title, description, start, end }) {
  // start/end: JS Date or ISO string
  const dtStart = new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = new Date(end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${description}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT\nEND:VCALENDAR`;
}

/**
 * AdminDashboard Component
 * 
 * This component provides administrative oversight of the entire PDF workflow system.
 * Admins can:
 * - View all submissions across all stages
 * - Monitor workflow progress and timing
 * - Access admin logs and system events
 * - Add sample data for testing
 * - Refresh data in real-time
 * 
 * Features:
 * - Dark/light theme support
 * - Real-time data refresh
 * - Comprehensive submission tracking
 * - Sample data generation
 * - Responsive table layout
 */
export default function AdminDashboard() {
  // UI state management
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); // Dark/light theme
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px'); // Font size preference
  
  // Data state management
  const [submissions, setSubmissions] = useState([]); // All submissions and admin logs
  const [activeTab, setActiveTab] = useState('all'); // Active tab: 'all', 'submitted', 'publication', 'logs'
  const [filter, setFilter] = useState(() => {
    // Load saved filter from localStorage
    const user = atob(sessionStorage.getItem('authUser') || '');
    return JSON.parse(localStorage.getItem(`adminFilter_${user}`) || '{}');
  });
  const [filtered, setFiltered] = useState([]);
  const [editingDeadline, setEditingDeadline] = useState(null); // submission index being edited
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Navigation and utilities
  const navigate = useNavigate(); // React Router navigation hook

  // Access control: verify user is authenticated as an admin
  useEffect(() => {
    const role = atob(sessionStorage.getItem('authRole') || ''); // Decode role from base64
    const exp = +sessionStorage.getItem('expiresAt') || 0; // Get session expiration time
    if (role !== 'admin' || Date.now() > exp) {
      window.alert('Unauthorized'); // Show error if not admin or session expired
      navigate('/login'); // Redirect to login page
    }
  }, [navigate]);

  // Persist user preferences to localStorage and apply to document
  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark); // Apply dark mode class
    document.documentElement.style.fontSize = fontSize; // Apply font size to document
    localStorage.setItem('theme', dark ? 'dark' : 'light'); // Save theme preference
    localStorage.setItem('fontSize', fontSize); // Save font size preference
    return () => {
      document.body.classList.remove('dark-mode'); // Cleanup dark mode class
      document.documentElement.style.fontSize = ''; // Reset font size
    };
  }, [dark, fontSize]);

  // Filtering logic
  useEffect(() => {
    // Save filter to localStorage
    const user = atob(sessionStorage.getItem('authUser') || '');
    localStorage.setItem(`adminFilter_${user}`, JSON.stringify(filter));
    // Apply filters
    let data = [...submissions];
    
    // Filter by active tab
    if (activeTab === 'publication') {
      // Show only Stage 3 documents ready for publication
      data = data.filter(s => s.stage === 'Stage3' && s.readyForPublication);
    } else if (activeTab === 'logs') {
      // Show only admin logs
      data = data.filter(s => s.action); // Admin logs have an 'action' property
    } else if (activeTab === 'submitted') {
      // Show all documents submitted to admin (Stage 3)
      data = data.filter(s => s.stage === 'Stage3');
    }
    // 'all' tab shows everything (no additional filtering)
    
    // Apply additional filters
    if (filter.user) {
      data = data.filter(s => (s.user || s.username || '').toLowerCase().includes(filter.user.toLowerCase()));
    }
    if (filter.status) {
      data = data.filter(s => (s.status || s.stage || '').toLowerCase().includes(filter.status.toLowerCase()));
    }
    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      data = data.filter(s => s.time && s.time >= from);
    }
    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime();
      data = data.filter(s => s.time && s.time <= to);
    }
    setFiltered(data);
  }, [filter, submissions, activeTab]);

  // Load submissions and admin logs from localStorage
  useEffect(() => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]'); // Get submissions
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]'); // Get admin logs
    console.log('Loaded submissions:', storedSubmissions); // Debug log
    console.log('Loaded admin log:', adminLog); // Debug log
    
    // Combine submissions with admin logs for comprehensive display
    const allEntries = [...storedSubmissions, ...adminLog];
    allEntries.sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Add a flag to distinguish between submissions and admin logs
    const processedEntries = allEntries.map(entry => ({
      ...entry,
      isSubmission: !entry.action && (entry.content || entry.file) && entry.filename, // Use either content or file
      isAdminLog: !!entry.action
    }));
    
    console.log('Processed entries:', processedEntries);
    setSubmissions(processedEntries); // Set combined data
  }, []);

  /**
   * Handle user logout by clearing session data and redirecting to login
   */
  const handleLogout = () => {
    sessionStorage.clear(); // Clear all session storage (auth data, etc.)
    navigate('/login'); // Redirect to login page
  };

  /**
   * Refresh submissions and admin logs from localStorage
   * 
   * This function reloads all data to ensure the dashboard shows the most current information.
   */
  const refreshSubmissions = () => {
    const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]'); // Get fresh submissions
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]'); // Get fresh admin logs
    console.log('Refreshed submissions:', storedSubmissions); // Debug log
    console.log('Refreshed admin log:', adminLog); // Debug log
    
    // Combine submissions with admin logs for comprehensive display
    const allEntries = [...storedSubmissions, ...adminLog];
    allEntries.sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Add a flag to distinguish between submissions and admin logs
    const processedEntries = allEntries.map(entry => ({
      ...entry,
      isSubmission: !entry.action && (entry.content || entry.file) && entry.filename, // Use either content or file
      isAdminLog: !!entry.action
    }));
    
    console.log('Processed entries:', processedEntries);
    setSubmissions(processedEntries); // Update state with fresh data
  };

  /**
   * Add sample data for testing and demonstration purposes
   * 
   * This function creates example submissions to populate the dashboard
   * when no real data is available, useful for testing and demonstrations.
   */
  const addSampleData = () => {
    // Create a minimal valid PDF base64 content for testing
    const minimalPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9Db250ZW50cyA1IDAgUg0KL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXQ0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCAxNA0KPj4NCnN0cmVhbQ0KQlQNCjEwMCA3MDAgVEQKL0YxIDEyIFRqDQpIZWxsbyBXb3JsZCEgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
    
    // Test the base64 content first
    try {
      const testBinary = atob(minimalPDFBase64);
      console.log('Sample PDF base64 is valid, binary length:', testBinary.length);
    } catch (error) {
      console.error('Sample PDF base64 is invalid:', error);
    }
    
    const sampleSubmissions = [
      {
        time: Date.now() - 3600000, // 1 hour ago
        user: 'john.doe',
        stage: 'Stage1',
        filename: 'john_doe_Stage1.pdf',
        notes: 'Initial submission',
        content: minimalPDFBase64
      },
      {
        time: Date.now() - 7200000, // 2 hours ago
        user: 'jane.smith',
        stage: 'Stage2',
        filename: 'jane_smith_Stage2.pdf',
        notes: 'Reviewed by librarian',
        content: minimalPDFBase64
      },
      {
        time: Date.now() - 10800000, // 3 hours ago
        user: 'bob.wilson',
        stage: 'Stage3',
        filename: 'bob_wilson_Stage3.pdf',
        notes: 'Final approval pending',
        content: minimalPDFBase64
      }
    ];
    console.log('Adding sample data:', sampleSubmissions);
    localStorage.setItem('submissions', JSON.stringify(sampleSubmissions)); // Save to localStorage
    setSubmissions(sampleSubmissions); // Update state
    console.log('Sample data saved to localStorage');
  };

  /**
   * Download a PDF file from base64 content
   * 
   * This function converts base64 content back to a downloadable PDF file
   * and triggers the browser's download mechanism.
   * 
   * @param {string} filename - The name of the file to download
   * @param {string} content - Base64 encoded PDF content
   */
  const downloadFile = (filename, content) => {
    if (!filename || !content) {
      console.error('Missing file information:', { filename, content: !!content });
      window.alert('Missing file information. Cannot download.');
      return;
    }
    
    console.log('Download attempt:', { 
      filename, 
      contentType: typeof content,
      isFile: content instanceof File,
      contentLength: content instanceof File ? content.size : (typeof content === 'string' ? content.length : 'unknown'),
      contentPreview: content instanceof File ? 'File object' : (typeof content === 'string' ? content.substring(0, 50) : 'not a string')
    });
    
    try {
      // If it's a File object, use it directly
      if (content instanceof File) {
        console.log('Processing File object...');
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`Downloaded File object: ${filename}`);
        return;
      }
      
      // Handle base64 content
      console.log('Processing base64 content...');
      
      // Check if content is actually a string
      if (typeof content !== 'string') {
        console.error('Content is not a string, cannot process as base64');
        console.log('Content type:', typeof content);
        console.log('Is File object:', content instanceof File);
        console.log('Content keys:', content && typeof content === 'object' ? Object.keys(content) : 'not an object');
        
        // If it's a corrupted File object from localStorage (empty object), show helpful message
        if (content && typeof content === 'object' && Object.keys(content).length === 0) {
          console.error('Detected corrupted File object from localStorage');
          window.alert('File object was corrupted during storage. This submission needs to be re-uploaded.');
          return;
        }
        
        window.alert('Invalid content type. Expected string or File but got: ' + typeof content);
        return;
      }
      
      let pdfData = content;
      
      // If it's a data URL, extract the base64 part
      if (pdfData.startsWith('data:')) {
        console.log('Extracting base64 from data URL...');
        pdfData = pdfData.split(',')[1];
      }
      
      // Clean the base64 string
      pdfData = pdfData.replace(/\s+/g, '');
      
      console.log('Processed content length:', pdfData.length);
      console.log('Content preview:', pdfData.substring(0, 200));
      
      // Validate that we have valid base64 content
      if (!pdfData || pdfData.length < 10) {
        console.error('Content too short:', pdfData.length);
        window.alert(`Invalid file content. Content length: ${pdfData.length}. The file may be corrupted or empty.`);
        return;
      }
      
      // More lenient base64 validation
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(pdfData)) {
        console.error('Invalid base64 format. First 50 chars:', pdfData.substring(0, 50));
        console.error('Contains invalid chars:', pdfData.match(/[^A-Za-z0-9+/=]/g));
        window.alert('Invalid base64 format. The file content may be corrupted.');
        return;
      }
      
      // Decode base64 to binary
      console.log('Decoding base64 to binary...');
      const binary = atob(pdfData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      console.log('Binary length:', bytes.length);
      console.log('First few bytes:', Array.from(bytes.slice(0, 10)));
      
      // Validate PDF header
      const pdfHeader = String.fromCharCode(...bytes.slice(0, 4));
      console.log('PDF header:', pdfHeader);
      if (pdfHeader !== '%PDF') {
        console.error('Invalid PDF header:', pdfHeader);
        window.alert('Invalid PDF header. The file may not be a valid PDF.');
        return;
      }
      
      // Create blob and download
      console.log('Creating blob and downloading...');
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully downloaded: ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Filename:', filename);
      console.error('Content type:', typeof content);
      console.error('Is File:', content instanceof File);
      console.error('Content length:', typeof content === 'string' ? content.length : (content instanceof File ? content.size : 'unknown'));
      console.error('Content preview:', typeof content === 'string' ? content.substring(0, 100) : 'not a string');
      
      let errorMessage = 'Error downloading PDF. ';
      if (error.name === 'InvalidCharacterError') {
        errorMessage += 'The file contains invalid characters.';
      } else if (error.name === 'TypeError') {
        errorMessage += 'The file format is not supported.';
      } else {
        errorMessage += 'The file content may be corrupted or invalid.';
      }
      
      window.alert(errorMessage);
    }
  };

  const previewFile = (filename, content) => {
    if (!filename || !content) {
      console.error('Missing file information:', { filename, content: !!content });
      window.alert('Missing file information. Cannot preview.');
      return;
    }
    
    try {
      // If it's a File object, use it directly
      if (content instanceof File) {
        const url = URL.createObjectURL(content);
        window.open(url, '_blank');
        return;
      }
      
      // Handle base64 content
      if (typeof content !== 'string') {
        window.alert('Invalid content type. Expected string or File but got: ' + typeof content);
        return;
      }
      
      let pdfData = content;
      
      // If it's a data URL, extract the base64 part
      if (pdfData.startsWith('data:')) {
        pdfData = pdfData.split(',')[1];
      }
      
      // Clean the base64 string
      pdfData = pdfData.replace(/\s+/g, '');
      
      // Create data URL for preview
      const dataUrl = `data:application/pdf;base64,${pdfData}`;
      
      // Open in new tab
      window.open(dataUrl, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      window.alert('Error previewing PDF. Please try again.');
    }
  };

  // Handler to set or update a deadline
  const handleDeadlineChange = (idx, value) => {
    setSubmissions(subs => {
      const updated = [...subs];
      updated[idx] = { ...updated[idx], deadline: value };
      // Persist to localStorage
      localStorage.setItem('submissions', JSON.stringify(updated));
      return updated;
    });
    setEditingDeadline(null);
  };
  // Handler to export deadline to calendar
  const handleExportCalendar = (submission) => {
    const title = `Deadline: ${submission.filename || submission.user || 'Document'}`;
    const description = `Deadline for document: ${submission.filename || ''}`;
    const start = submission.deadline;
    const end = submission.deadline;
    const ics = generateICS({ title, description, start, end });
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Publish document to external repository
  const publishDocument = async (submission) => {
    if (!submission || submission.stage !== 'Stage3' || !submission.readyForPublication) {
      window.alert('This document is not ready for publication.');
      return;
    }

    // Get current admin name
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    
    // Prompt for repository selection
    const repository = window.prompt(
      'Select repository to publish to:\n\n' +
      '1. DSpace Repository\n' +
      '2. arXiv\n' +
      '3. ResearchGate\n' +
      '4. Academia.edu\n' +
      '5. Custom Repository\n\n' +
      'Enter the number (1-5) or repository name:'
    );
    
    if (!repository) return;
    
    // Prompt for additional metadata
    const doi = window.prompt('Enter DOI (optional):');
    const keywords = window.prompt('Enter keywords (comma-separated, optional):');
    const abstract = window.prompt('Enter abstract (optional):');
    
    // Update submission to Stage 4 (published)
    // Note: This document will no longer appear in the reviewer's "sent" tab
    // as it's now in Stage4 and published by admin
    // The filtering logic will handle this automatically
    const updatedSubs = submissions.map(s => {
      if (s === submission) {
        return {
          ...s,
          stage: 'Stage4',
          filename: s.filename.replace('_Stage3.pdf', '_Stage4.pdf'),
          time: Date.now(),
          publishedBy: currentUser,
          publishedAt: new Date().toISOString(),
          repository: repository,
          doi: doi || null,
          keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
          abstract: abstract || null,
          publicationStatus: 'published'
        };
      }
      return s;
    });
    
    // Log the publication action
    const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]');
    adminLog.push({
      time: Date.now(),
      user: currentUser,
      stage: 'PUBLISHED',
      filename: submission.filename,
      notes: `Published to ${repository}${doi ? ` (DOI: ${doi})` : ''}`,
      action: 'published',
      repository: repository,
      doi: doi
    });
    localStorage.setItem('adminLog', JSON.stringify(adminLog));
    
    // Update submissions
    localStorage.setItem('submissions', JSON.stringify(updatedSubs));
    setSubmissions(updatedSubs);
    
    // Show success message
    window.alert(`Successfully published ${submission.filename} to ${repository}!`);
  };

  /**
   * AdminDashboard Component - Comprehensive Styling Object
   * 
   * This object contains all the styling for the admin dashboard page.
   * Each style function takes theme parameters (dark/light mode) and returns
   * appropriate CSS properties for responsive, accessible design.
   */
  const styles = {
    // Full-screen background with theme support
    body: (dark, fontSize) => ({
      fontFamily: "'BentonSans Book', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      margin: 0,
      background: dark ? '#1e1e1e' : '#f1f1f1',
      color: dark ? '#fff' : '#201436',
      transition: 'background .3s,color .3s',
      fontSize,
      boxSizing: 'border-box',
      overflowX: 'hidden',
      maxWidth: '100vw',
    }),
    // Settings bar positioned in top-right corner
    settingsBar: {
      position: 'fixed',
      top: 15,
      right: 20,
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      zIndex: 1000,
    },
    // Font size selector dropdown styling
    select: dark => ({
      fontFamily: "'BentonSans Book'",
      borderRadius: 4,
      border: '1px solid #ccc',
      padding: '.4rem 1rem',
      background: dark ? '#2e2e2e' : '#fff',
      color: dark ? '#fff' : '#201436',
      fontSize: '1rem',
      outline: 'none',
      transition: 'background .3s,color .3s',
    }),
    // Button styling with hover effects
    button: (dark, hover) => ({
      padding: '.5rem 1rem',
      border: 'none',
      background: '#4F2683',
      color: '#fff',
      borderRadius: 4,
      fontFamily: "'BentonSans Book'",
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background .3s',
      outline: 'none',
      opacity: hover ? 0.85 : 1,
    }),
    // Main container with proper spacing and layout
    container: dark => ({
      marginTop: 60,
      padding: '2rem',
      flex: 1,
      overflow: 'auto',
      background: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      width: '100%',
      maxWidth: '100vw',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }),
    // Main heading styling
    h1: dark => ({
      fontFamily: "'BentonSans Bold'",
      textAlign: 'center',
      color: dark ? '#fff' : '#201436',
      fontSize: '2rem',
      margin: 0,
      marginBottom: '1.5rem',
      letterSpacing: '-1px',
      transition: 'color .3s',
    }),
    // Table styling for data display
    table: dark => ({
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
      background: 'none',
      tableLayout: 'fixed',
      minWidth: 0,
      maxWidth: '100%',
    }),
    // Table header styling
    th: dark => ({
      background: dark ? '#2e2e2e' : '#eee',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontWeight: 600,
      fontFamily: "'BentonSans Book'",
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: 0,
    }),
    // Table cell styling with empty state support
    td: (dark, empty) => ({
      background: 'none',
      color: dark ? '#fff' : '#201436',
      border: dark ? '1px solid #555' : '1px solid #ccc',
      padding: '.5rem',
      textAlign: 'left',
      fontFamily: "'BentonSans Book'",
      opacity: empty ? 0.7 : 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: 0,
    }),
  };

  // Filter bar handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(f => ({ ...f, [name]: value }));
  };
  const handleClearFilters = () => {
    setFilter({});
  };

  return (
    <div style={{ ...styles.body(dark, fontSize), flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div style={styles.settingsBar}>
        <label htmlFor="darkModeToggle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input 
            id="darkModeToggle"
            name="darkMode"
            type="checkbox" 
            checked={dark} 
            onChange={e => setDark(e.target.checked)} 
          />
          <span style={{ marginLeft: 6 }}>{dark ? '🌙' : '☀'}</span>
        </label>
        <label htmlFor="fontSizeSelect" style={{ display: 'none' }}>Font Size</label>
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
        <button onClick={refreshSubmissions} style={styles.button(dark, false)}>🔄 Refresh</button>
        <button onClick={addSampleData} style={styles.button(dark, false)}>📊 Sample Data</button>
        <button onClick={() => {
          localStorage.removeItem('submissions');
          localStorage.removeItem('adminLog');
          refreshSubmissions();
        }} style={styles.button(dark, false)}>🗑️ Clear Data</button>
        <button onClick={() => {
          const storedSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
          const adminLog = JSON.parse(localStorage.getItem('adminLog') || '[]');
          console.log('=== DEBUG DATA ===');
          console.log('All submissions:', storedSubmissions);
          console.log('All admin logs:', adminLog);
          
          // Detailed analysis of each submission
          storedSubmissions.forEach((sub, index) => {
            console.log(`--- Submission ${index + 1} ---`);
            console.log('Filename:', sub.filename);
            console.log('Stage:', sub.stage);
            console.log('Has content:', !!sub.content);
            console.log('Has file:', !!sub.file);
            console.log('Content type:', typeof sub.content);
            console.log('Content length:', sub.content ? sub.content.length : 'N/A');
            console.log('Content preview:', sub.content ? sub.content.substring(0, 100) : 'N/A');
            if (sub.content) {
              try {
                const testBinary = atob(sub.content);
                console.log('Base64 decode successful, binary length:', testBinary.length);
              } catch (error) {
                console.log('Base64 decode failed:', error.message);
              }
            }
          });
          console.log('=== END DEBUG ===');
          window.alert(`Found ${storedSubmissions.length} submissions and ${adminLog.length} admin logs. Check console for detailed analysis.`);
        }} style={styles.button(dark, false)}>🔍 Debug Data</button>
        <button onClick={() => {
          // Test download with a known good PDF
          const testPDFBase64 = 'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9Db250ZW50cyA1IDAgUg0KL01lZGlhQm94IFsgMCAwIDYxMiA3OTIgXQ0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQo+Pg0KZW5kb2JqDQo1IDAgb2JqDQo8PA0KL0xlbmd0aCAxNA0KPj4NCnN0cmVhbQ0KQlQNCjEwMCA3MDAgVEQKL0YxIDEyIFRqDQpIZWxsbyBXb3JsZCEgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTAgMDAwMDAgbg0KMDAwMDAwMDA3OSAwMDAwMCBuDQowMDAwMDAwMTczIDAwMDAwIG4NCjAwMDAwMDAzMDEgMDAwMDAgbg0KMDAwMDAwMDM4MCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1NpemUgNg0KL1Jvb3QgMSAwIFINCj4+DQpzdGFydHhyZWYNCjQ5Mg0KJSVFT0Y=';
          downloadFile('test_download.pdf', testPDFBase64);
        }} style={styles.button(dark, false)}>🧪 Test Download</button>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* Main Card */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Administrator Dashboard</h1>
        <p style={{ 
          textAlign: 'center', 
          color: dark ? '#9ca3af' : '#6b7280', 
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          Download buttons are only available for documents that have been approved and published by the final reviewer
        </p>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 18,
          borderBottom: `1px solid ${dark ? '#4a5568' : '#e2e8f0'}`,
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'all' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'all' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'all' ? 600 : 400,
              transition: 'all 0.3s ease',
            }}
          >
            📊 All Submissions
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'submitted' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'submitted' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'submitted' ? 600 : 400,
              transition: 'all 0.3s ease',
            }}
          >
            📥 Submitted to Me ({submissions.filter(s => s.stage === 'Stage3').length})
          </button>
          <button
            onClick={() => setActiveTab('publication')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'publication' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'publication' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'publication' ? 600 : 400,
              transition: 'all 0.3s ease',
            }}
          >
            📤 Publication ({submissions.filter(s => s.stage === 'Stage3' && s.readyForPublication).length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'logs' ? (dark ? '#4F2683' : '#a259e6') : 'transparent',
              color: activeTab === 'logs' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
              border: '1.5px solid #bbaed6',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontFamily: "'BentonSans Book'",
              fontSize: '0.9rem',
              fontWeight: activeTab === 'logs' ? 600 : 400,
              transition: 'all 0.3s ease',
            }}
          >
            📋 Admin Logs ({submissions.filter(s => s.action).length})
          </button>
        </div>
        {/* Filter Toggle Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              title="filter search settings"
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: '1.5px solid #bbaed6',
                background: dark ? '#4F2683' : '#a259e6',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                minWidth: '40px',
                justifyContent: 'center'
              }}
            >
              ⚙️
              <span style={{ fontSize: '0.7rem' }}>▼</span>
            </button>
            
            {/* Filter Dropdown Menu */}
            {filterDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: dark ? '#2a1a3a' : '#fff',
                border: '1.5px solid #bbaed6',
                borderRadius: 8,
                padding: 12,
                minWidth: 200,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000
              }}>
                {/* User Filter */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: dark ? '#e0d6f7' : '#201436',
                    marginBottom: 4
                  }}>
                    User:
                  </label>
                  <input
                    type="text"
                    name="user"
                    value={filter.user || ''}
                    onChange={handleFilterChange}
                    placeholder="Filter by user"
                    style={{ 
                      width: '100%',
                      padding: '6px 8px', 
                      borderRadius: 4, 
                      border: '1px solid #bbaed6',
                      background: dark ? '#1a1a2e' : '#f9f9f9',
                      color: dark ? '#e0d6f7' : '#201436',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                
                {/* Status Filter */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: dark ? '#e0d6f7' : '#201436',
                    marginBottom: 4
                  }}>
                    Status:
                  </label>
                  <input
                    type="text"
                    name="status"
                    value={filter.status || ''}
                    onChange={handleFilterChange}
                    placeholder="Filter by status"
                    style={{ 
                      width: '100%',
                      padding: '6px 8px', 
                      borderRadius: 4, 
                      border: '1px solid #bbaed6',
                      background: dark ? '#1a1a2e' : '#f9f9f9',
                      color: dark ? '#e0d6f7' : '#201436',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
                
                {/* Date Range */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: dark ? '#e0d6f7' : '#201436',
                    marginBottom: 4
                  }}>
                    Date Range:
                  </label>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filter.dateFrom || ''}
                      onChange={handleFilterChange}
                      style={{ 
                        flex: 1,
                        padding: '6px 8px', 
                        borderRadius: 4, 
                        border: '1px solid #bbaed6',
                        background: dark ? '#1a1a2e' : '#f9f9f9',
                        color: dark ? '#e0d6f7' : '#201436',
                        fontSize: '0.8rem'
                      }}
                    />
                    <input
                      type="date"
                      name="dateTo"
                      value={filter.dateTo || ''}
                      onChange={handleFilterChange}
                      style={{ 
                        flex: 1,
                        padding: '6px 8px', 
                        borderRadius: 4, 
                        border: '1px solid #bbaed6',
                        background: dark ? '#1a1a2e' : '#f9f9f9',
                        color: dark ? '#e0d6f7' : '#201436',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    handleClearFilters();
                    setFilterDropdownOpen(false);
                  }}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px', 
                    borderRadius: 6, 
                    background: '#e74c3c', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear Filters
                </button>
                
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: '#888', 
                  marginTop: 8, 
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Filters are saved automatically
                </div>
              </div>
            )}
          </div>
        </div>
        <div 
          className="admin-table-container"
          style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden',
            maxHeight: '60vh', 
            width: '100%',
            border: `1px solid ${dark ? '#555' : '#ccc'}`,
            borderRadius: '8px',
            // Custom scrollbar styling to match purple gradient
            scrollbarWidth: 'thin',
            scrollbarColor: '#7c3aed #4F2683',
            minWidth: 0,
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <style>{`
            .admin-table-container::-webkit-scrollbar {
              width: 8px;
            }
            .admin-table-container::-webkit-scrollbar-track {
              background: #4F2683;
              border-radius: 4px;
            }
            .admin-table-container::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%);
              border-radius: 4px;
              border: 1px solid #4F2683;
            }
            .admin-table-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #5b2b8f 0%, #8b5cf6 50%, #c084fc 100%);
            }
          `}</style>
          <table style={styles.table(dark)}>
            <thead>
              <tr>
                <th style={{...styles.th(dark), width: '12%'}}>Time</th>
                <th style={{...styles.th(dark), width: '10%'}}>User</th>
                <th style={{...styles.th(dark), width: '8%'}}>Stage</th>
                <th style={{...styles.th(dark), width: '15%'}}>Progress</th>
                <th style={{...styles.th(dark), width: '15%'}}>Filename</th>
                <th style={{...styles.th(dark), width: '12%'}}>Notes</th>
                <th style={{...styles.th(dark), width: '15%'}}>Actions</th>
                <th style={{...styles.th(dark), width: '8%'}}>Deadline</th>
                <th style={{...styles.th(dark), width: '5%'}}>Calendar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={styles.td(dark, true)}>No submissions yet.</td></tr>
              ) : (
                filtered.map((s, i) => {
                  // Calculate progress percentage based on stage
                  const stages = ['Stage0', 'Stage1', 'Stage2', 'Stage3', 'Stage4'];
                  const stageIndex = stages.indexOf(s.stage || 'Stage0');
                  const progressPercentage = ((stageIndex + 1) / stages.length) * 100;
                  
                  // Get status for badge
                  const getStatus = () => {
                    if (s.action === 'sent_back') return 'Returned';
                    if (s.stage === 'Stage4') return 'Published';
                    if (s.stage === 'Stage3') return 'Approved';
                    if (s.stage === 'Stage2') return 'In Review';
                    if (s.stage === 'Stage1') return 'In Review';
                    return 'Pending';
                  };
                  
                  const status = getStatus();
                  
                  return (
                    <tr key={i}>
                      <td style={styles.td(dark)}>{new Date(s.time).toLocaleString()}</td>
                      <td style={styles.td(dark)}>{s.user}</td>
                      <td style={styles.td(dark)}>
                        {s.action === 'sent_back' ? (
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>SENT BACK</span>
                        ) : (
                          s.stage
                        )}
                      </td>
                      <td style={styles.td(dark)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '60px',
                            height: '8px',
                            backgroundColor: dark ? '#374151' : '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progressPercentage}%`,
                              background: 'linear-gradient(90deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: dark ? '#9ca3af' : '#6b7280',
                            minWidth: '30px',
                          }}>
                            {Math.round(progressPercentage)}%
                          </span>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            ...(status === 'Pending' ? {
                              background: dark ? '#3b82f6' : '#dbeafe',
                              color: dark ? '#bfdbfe' : '#1e40af',
                            } : status === 'In Review' ? {
                              background: dark ? '#f59e0b' : '#fef3c7',
                              color: dark ? '#fde68a' : '#92400e',
                            } : status === 'Approved' ? {
                              background: dark ? '#10b981' : '#d1fae5',
                              color: dark ? '#a7f3d0' : '#065f46',
                            } : status === 'Published' ? {
                              background: dark ? '#8b5cf6' : '#ede9fe',
                              color: dark ? '#c4b5fd' : '#5b21b6',
                            } : {
                              background: dark ? '#ef4444' : '#fee2e2',
                              color: dark ? '#fca5a5' : '#991b1b',
                            })
                          }}>
                            {status}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td(dark)}>{s.filename}</td>
                      <td style={styles.td(dark)}>{s.notes || ''}</td>
                      <td style={styles.td(dark)}>
                        {s.isSubmission && (s.content || s.file) && s.filename && s.stage === 'Stage3' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                const downloadContent = s.content || s.file;
                                downloadFile(s.filename, downloadContent);
                              }}
                              style={{
                                ...styles.button(dark, false),
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                margin: '0',
                              }}
                              title="Download Published PDF"
                            >
                              📥 Download
                            </button>
                            <button
                              onClick={() => {
                                const previewContent = s.content || s.file;
                                previewFile(s.filename, previewContent);
                              }}
                              style={{
                                ...styles.button(dark, false),
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                margin: '0',
                                background: '#007bff',
                              }}
                              title="Preview Published PDF"
                            >
                              👁️ Preview
                            </button>
                            {s.readyForPublication && (
                              <button
                                onClick={() => publishDocument(s)}
                                style={{
                                  ...styles.button(dark, false),
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  margin: '0',
                                  background: '#059669',
                                  border: '2px solid #059669',
                                }}
                                title="Publish to External Repository"
                              >
                                📤 Publish
                              </button>
                            )}
                          </div>
                        ) : s.isSubmission && (s.content || s.file) && s.filename ? (
                          <span style={{ 
                            color: dark ? '#9ca3af' : '#6b7280', 
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}>
                            Pending approval
                          </span>
                        ) : (
                          <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: '0.75rem' }}>
                            {s.isAdminLog ? 'Log entry' : 'No file'}
                          </span>
                        )}
                      </td>
                      <td style={styles.td(dark)}>
                        {editingDeadline === i ? (
                          <input
                            type="datetime-local"
                            value={s.deadline ? new Date(s.deadline).toISOString().slice(0, 16) : ''}
                            onChange={e => handleDeadlineChange(i, new Date(e.target.value).toISOString())}
                            onBlur={() => setEditingDeadline(null)}
                            style={{ padding: 6, borderRadius: 6, border: '1.5px solid #bbaed6', minWidth: 160 }}
                            autoFocus
                            aria-label="Set deadline"
                          />
                        ) : (
                          s.deadline ? (
                            <span style={{ cursor: 'pointer' }} onClick={() => setEditingDeadline(i)} title="Edit deadline">{new Date(s.deadline).toLocaleString()}</span>
                          ) : (
                            <button
                              onClick={() => setEditingDeadline(i)}
                              style={{ padding: '4px 10px', borderRadius: 6, background: '#a259e6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                              aria-label="Add deadline"
                            >
                              + Add
                            </button>
                          )
                        )}
                      </td>
                      <td style={styles.td(dark)}>
                        {s.deadline && (
                          <button
                            onClick={() => handleExportCalendar(s)}
                            style={{ padding: '4px 10px', borderRadius: 6, background: '#4F2683', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                            aria-label="Export deadline to calendar"
                            title="Export to calendar"
                          >
                            📅 Add to Calendar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile & accessibility tips (now below the main content, centered horizontally) */}
      <div className="mt-4 text-xs text-gray-500" aria-live="polite" style={{ textAlign: 'center', marginTop: 24, maxWidth: 400, width: '100%' }}>
        <div>Optimized for mobile and desktop. Use keyboard navigation to tab through fields.</div>
        <div>Touch-friendly buttons. Screen reader friendly. All errors and progress are announced.</div>
      </div>
    </div>
  );
}