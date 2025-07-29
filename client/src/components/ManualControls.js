// --- ManualControls.js ---
// React component for admin-only manual workflow controls and simulation.
// Provides navigation shortcuts, workflow logging, and system management tools.
// Allows admins to simulate workflow stages and track system activities.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ManualControls Component
 * 
 * This component provides administrative controls for manual workflow simulation
 * and system management. It's restricted to admin users only and provides:
 * - Quick navigation to different workflow stages
 * - Workflow activity logging
 * - System simulation tools
 * - Theme and font size controls
 * 
 * Features:
 * - Admin-only access control
 * - Workflow simulation logging
 * - Quick navigation buttons
 * - Dark/light theme support
 * - Persistent settings storage
 */
export default function ManualControls() {
  // UI state management
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark'); // Dark/light theme
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '14px'); // Font size preference
  const [confirmOn, setConfirmOn] = useState(localStorage.getItem('confirmOn') !== 'false'); // Confirmation dialogs
  
  // Data state management
  const [log, setLog] = useState([]); // Workflow activity log
  
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
    localStorage.setItem('confirmOn', confirmOn); // Save confirmation dialog preference
    return () => {
      document.body.classList.remove('dark-mode'); // Cleanup dark mode class
      document.documentElement.style.fontSize = ''; // Reset font size
    };
  }, [dark, fontSize, confirmOn]);

  // Load workflow log from localStorage
  useEffect(() => {
    setLog(JSON.parse(localStorage.getItem('workflowLog') || '[]')); // Load existing log
  }, []);

  /**
   * Add a new entry to the workflow log
   * 
   * @param {string} msg - The log message to add
   */
  const addLog = (msg) => {
    const newLog = [...log, msg]; // Add new message to log
    setLog(newLog); // Update state
    localStorage.setItem('workflowLog', JSON.stringify(newLog)); // Save to localStorage
  };

  /**
   * Simulate navigation to different workflow stages
   * 
   * @param {string} route - The route to navigate to
   * @param {string} label - The label for the log entry
   */
  const goTo = (route, label) => {
    if (confirmOn && !window.confirm('Go there?')) return; // Show confirmation if enabled
    addLog(`Simulated: ${label} at ${new Date().toLocaleString()}`); // Log the navigation
    navigate(route); // Navigate to the specified route
  };

  /**
   * Handle user logout by clearing session data and redirecting to login
   */
  const handleLogout = () => {
    sessionStorage.clear(); // Clear all session storage (auth data, etc.)
    navigate('/login'); // Redirect to login page
  };

  /**
   * ManualControls Component - Comprehensive Styling Object
   * 
   * This object contains all the styling for the manual controls page.
   * Each style function takes theme parameters (dark/light mode) and returns
   * appropriate CSS properties for responsive, accessible design.
   */
  const styles = {
    // Full-screen background with gradient based on theme
    body: (dark, fontSize) => ({
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: dark ? 'linear-gradient(to bottom, #1a1a2e, #0f3460)' : 'linear-gradient(to bottom, #f0f2f5, #d6e4ff)',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: fontSize,
    }),
    // Settings bar positioned in top-right corner
    settingsBar: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      zIndex: 10,
    },
    // Dark/light mode toggle slider styling
    slider: (dark) => ({
      position: 'relative',
      width: '40px',
      height: '20px',
      backgroundColor: dark ? '#e0d6f7' : '#201436',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2px',
    }),
    // Slider button styling with smooth transitions
    sliderBefore: (dark) => ({
      content: '""',
      position: 'absolute',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: dark ? '#e0d6f7' : '#201436',
      top: '2px',
      left: dark ? 'calc(100% - 18px)' : '2px',
      transition: '0.3s',
    }),
    // Font size selector dropdown styling
    select: (dark) => ({
      padding: '8px 12px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: dark ? '#201436' : '#f0f2f5',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22%3E%3Cpolygon points=%220,0 10,0 5,10%22 fill=%22%23e0d6f7%22/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '10px',
    }),
    // Button styling with primary/secondary variants
    button: (dark, isPrimary) => ({
      padding: '10px 20px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: isPrimary ? '#4f46e5' : dark ? '#201436' : '#e0d6f7',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: isPrimary ? '#6366f1' : dark ? '#3730a3' : '#d6e4ff',
      },
    }),
    // Main heading styling
    h1: (dark) => ({
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      color: dark ? '#e0d6f7' : '#201436',
    }),
    // Main container with card-like appearance
    container: (dark) => ({
      width: '100%',
      maxWidth: '500px',
      padding: '20px',
      backgroundColor: dark ? '#1a1a2e' : '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: fontSize,
    }),
    // Log display area with custom scrollbar
    log: (dark) => ({
      marginTop: '20px',
      padding: '15px',
      borderRadius: '10px',
      backgroundColor: dark ? '#201436' : '#f0f2f5',
      color: dark ? '#e0d6f7' : '#201436',
      fontFamily: 'monospace',
      minHeight: '100px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: dark ? '#1a1a2e' : '#f0f2f5',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: dark ? '#3730a3' : '#d6e4ff',
        borderRadius: '4px',
      },
    }),
  };

  return (
    <div style={styles.body(dark, fontSize)}>
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
        <label htmlFor="darkModeToggle" style={{ display: 'flex', alignItems: 'center' }}>
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
        <label htmlFor="confirmToggle" style={{ color: dark ? '#e0d6f7' : '#201436' }}>
          <input 
            id="confirmToggle"
            name="confirmOn"
            type="checkbox" 
            checked={confirmOn} 
            onChange={e => setConfirmOn(e.target.checked)} 
          />
          <span className="ml-1">Confirm</span>
        </label>
        <button onClick={handleLogout} style={styles.button(dark, false)}>Logout</button>
      </div>
      {/* Main Card */}
      <div style={styles.container(dark)}>
        <h1 style={styles.h1(dark)}>Manual Workflow Controls</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <button style={styles.button(dark, false)} onClick={() => goTo('/submit', 'Student Submission')}>Simulate Student Submission</button>
          <button style={styles.button(dark, false)} onClick={() => goTo('/review', 'Librarian Review')}>Simulate Librarian Review</button>
          <button style={styles.button(dark, false)} onClick={() => goTo('/final-approval', 'Final Approval')}>Simulate Final Approval</button>
        </div>
        <div style={styles.log(dark)}>
          {log.length === 0 ? 'No workflow actions yet.' : log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
}