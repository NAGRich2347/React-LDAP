// --- index.js ---
// Main entry point for the React application.
// Initializes the React root and renders the main App component.
// This is the first file executed when the application starts.

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Application Entry Point
 * 
 * This file serves as the main entry point for the React application.
 * It sets up the React root using the new React 18 createRoot API and
 * renders the main App component into the DOM.
 * 
 * Key Functions:
 * - Initialize React root with modern API
 * - Mount the main App component
 * - Handle the application bootstrap process
 * 
 * The root element is expected to be a DOM element with id="root"
 * which is typically defined in the public/index.html file.
 */

// Get the root DOM element where the React app will be mounted
const container = document.getElementById('root');

// Create the React root using the modern createRoot API (React 18+)
const root = createRoot(container);

// Render the main App component into the React root
root.render(<App />);
