// --- UploadForm.js ---
// React component for secure file upload functionality.
// Handles PDF, Word documents, and text files with validation and error handling.
// Provides user feedback and loading states during upload process.

import React, { useState } from 'react';
import api from '../services/api';

// Allowed file types for upload (MIME types)
const ALLOWED_TYPES = [
  'application/pdf', // PDF files
  'application/msword', // DOC files
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
  'text/plain' // TXT files
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB maximum file size

/**
 * UploadForm Component
 * 
 * This component provides a secure file upload interface for the workflow system.
 * It validates file types and sizes before uploading to ensure system security
 * and performance.
 * 
 * Features:
 * - File type validation (PDF, DOC, DOCX, TXT)
 * - File size validation (max 10MB)
 * - Real-time error feedback
 * - Loading states during upload
 * - Success confirmation
 * - Form reset after successful upload
 * 
 * Security:
 * - MIME type validation
 * - File size limits
 * - Secure API communication
 */
export default function UploadForm() {
  // Form state management
  const [file, setFile] = useState(null); // Selected file for upload
  const [error, setError] = useState(''); // Error message display
  const [success, setSuccess] = useState(''); // Success message display
  const [loading, setLoading] = useState(false); // Loading state during upload
  const [progress, setProgress] = useState(0); // Progress indicator
  const [retry, setRetry] = useState(false); // Retry state for failed uploads

  // Real-time validation feedback
  const validateFile = (selected) => {
    if (!selected) return '';
    if (!ALLOWED_TYPES.includes(selected.type)) {
      return 'Only PDF, Word, and TXT files are allowed. Please select a valid file type.';
    }
    if (selected.size > MAX_SIZE) {
      return 'File size must be 10MB or less. Please choose a smaller file.';
    }
    return '';
  };

  /**
   * Handle file selection and validate type/size
   * 
   * This function validates the selected file against allowed types and size limits
   * before setting it for upload. It provides immediate feedback to the user.
   * 
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    setRetry(false); // Reset retry state
    setProgress(0); // Reset progress
    const selected = e.target.files[0]; // Get the selected file
    
    if (!selected) return; // No file selected
    
    const validationMsg = validateFile(selected);
    if (validationMsg) {
      setError(validationMsg);
      setFile(null);
      return;
    }
    
    setFile(selected); // Set valid file for upload
  };

  /**
   * Handle form submission and upload file to backend
   * 
   * This function creates a FormData object and sends the file to the backend API.
   * It handles loading states and provides user feedback throughout the process.
   * 
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    setRetry(false); // Reset retry state
    setProgress(0); // Reset progress
    
    if (!file) {
      setError('Please select a file to upload.'); // Validate file is selected
      return;
    }
    
    setLoading(true); // Start loading state
    
    try {
      const formData = new FormData(); // Create FormData for file upload
      formData.append('file', file); // Add file to form data
      formData.append('filename', file.name); // Add filename to form data
      
      // Send file to backend API endpoint
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Set correct content type for file upload
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        }
      });
      
      setSuccess('File uploaded successfully!'); // Show success message
      setFile(null); // Reset file selection
      setProgress(0); // Reset progress
    } catch (err) {
      setError('Upload failed. Please check your internet connection or try a different file.'); // Show error message on failure
      setRetry(true); // Set retry state
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleRetry = (e) => {
    setRetry(false);
    setError('');
    setSuccess('');
    setProgress(0);
    if (file) {
      // Simulate form submit
      handleSubmit(e);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md" style={{ maxWidth: 400 }}>
      <h2 className="text-xl font-bold mb-4">Upload Document</h2>
      <form onSubmit={handleSubmit} aria-label="Upload form" autoComplete="off">
        {/* File input with accepted file types */}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt" // Browser-level file type filtering
          onChange={handleFileChange}
          className="mb-2 block w-full"
          aria-label="Select file to upload"
        />
        
        {/* Real-time validation feedback */}
        {file && !error && (
          <div className="text-green-700 mb-2" aria-live="polite">File ready: {file.name}</div>
        )}
        {error && (
          <div className="text-red-600 mb-2" aria-live="assertive" role="alert">
            {error}
            {error.includes('type') && (
              <div>Tip: Try converting your file to PDF, DOC, DOCX, or TXT format.</div>
            )}
            {error.includes('size') && (
              <div>Tip: Use a PDF compressor or split your document into smaller parts.</div>
            )}
            {error.includes('internet') && (
              <div>Tip: Check your connection or try again later.</div>
            )}
          </div>
        )}
        {success && <div className="text-green-600 mb-2" aria-live="polite">{success}</div>}
        {/* Progress bar */}
        {loading && (
          <div className="w-full bg-gray-200 rounded h-2 mb-2" aria-label="Upload progress">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${progress}%`, transition: 'width 0.3s' }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        )}
        {/* Submit button with loading state */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          disabled={loading} // Disable button during upload
          aria-busy={loading}
        >
          {loading ? 'Uploading...' : 'Upload'} {/* Show loading text or upload text */}
        </button>
        {retry && (
          <button
            type="button"
            className="px-4 py-2 bg-yellow-500 text-white rounded w-full mt-2"
            onClick={handleRetry}
            aria-label="Retry upload"
          >
            Retry
          </button>
        )}
      </form>
      {/* Mobile & accessibility tips */}
      <div className="mt-4 text-xs text-gray-500" aria-live="polite">
        <div>Supported on mobile and desktop. Use keyboard navigation to tab through fields.</div>
        <div>Screen reader friendly. All errors and progress are announced.</div>
      </div>
    </div>
  );
} 