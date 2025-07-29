import React, { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker to use local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

/**
 * FileUpload Component
 * 
 * Advanced file upload component with:
 * - Drag & drop with visual feedback
 * - PDF thumbnail preview
 * - File validation with helpful error messages
 * - Bulk file upload support
 * - Progress indicators
 * 
 * @param {Array} files - Array of selected files
 * @param {Function} onFilesChange - Callback when files change
 * @param {boolean} dark - Dark/light theme state
 * @param {boolean} multiple - Allow multiple file selection
 * @param {number} maxFiles - Maximum number of files allowed
 * @param {number} maxSizeMB - Maximum file size in MB
 */
const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  dark, 
  multiple = false, 
  maxFiles = 5, 
  maxSizeMB = 10 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // File validation
  const validateFile = useCallback((file) => {
    const errors = [];
    
    // Check file type
    if (!file.type.includes('pdf')) {
      errors.push('Only PDF files are allowed');
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be under ${maxSizeMB}MB. Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }
    
    // Check if we're at max files limit
    if (multiple && files.length >= maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    return errors;
  }, [files.length, maxFiles, maxSizeMB, multiple]);

  // Generate preview for PDF files
  const generatePreview = useCallback(async (file) => {
    if (file.type.includes('pdf')) {
      try {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [file.name]: url }));
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    }
  }, []);

  // Handle file selection
  const handleFiles = useCallback((selectedFiles) => {
    const newErrors = {};
    const validFiles = [];
    
    Array.from(selectedFiles).forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors[file.name] = fileErrors;
      } else {
        validFiles.push(file);
        generatePreview(file);
      }
    });
    
    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
      onFilesChange(updatedFiles);
    }
  }, [files, multiple, onFilesChange, validateFile, generatePreview]);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((fileName) => {
    const updatedFiles = files.filter(file => file.name !== fileName);
    onFilesChange(updatedFiles);
    
    // Clean up preview URL
    if (previewUrls[fileName]) {
      URL.revokeObjectURL(previewUrls[fileName]);
      setPreviewUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[fileName];
        return newUrls;
      });
    }
    
    // Clear error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
  }, [files, onFilesChange, previewUrls]);

  // Simulate upload progress (replace with actual upload logic)
  const simulateUpload = useCallback((fileName) => {
    setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[fileName] || 0;
        if (current >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [fileName]: current + 10 };
      });
    }, 200);
  }, []);

  // Styles
  const styles = {
    container: {
      width: '100%',
    },
    dropZone: (isDragActive) => ({
      border: `2px dashed ${isDragActive ? '#4F2683' : dark ? '#4F2683' : '#bbaed6'}`,
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center',
      background: isDragActive 
        ? (dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)')
        : (dark ? '#2a1a3a' : '#f9f9f9'),
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    dropZoneText: (isDragActive) => ({
      fontSize: '1.1rem',
      color: isDragActive ? '#4F2683' : (dark ? '#e0d6f7' : '#201436'),
      marginBottom: '0.5rem',
      fontWeight: isDragActive ? '600' : '400',
    }),
    dropZoneSubtext: {
      fontSize: '0.9rem',
      color: dark ? '#bbaed6' : '#666',
      marginBottom: '1rem',
    },
    fileInput: {
      display: 'none',
    },
    uploadButton: (dark) => ({
      background: '#4F2683',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background 0.3s ease',
      marginTop: '1rem',
    }),
    fileList: {
      marginTop: '1.5rem',
    },
    fileItem: (dark) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      background: dark ? 'rgba(36, 18, 54, 0.5)' : 'rgba(255, 255, 255, 0.8)',
      border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
      borderRadius: '8px',
      marginBottom: '0.75rem',
      transition: 'all 0.3s ease',
    }),
    filePreview: {
      width: '60px',
      height: '80px',
      marginRight: '1rem',
      borderRadius: '4px',
      overflow: 'hidden',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ddd',
    },
    fileInfo: {
      flex: 1,
    },
    fileName: (dark) => ({
      fontSize: '1rem',
      fontWeight: '600',
      color: dark ? '#e0d6f7' : '#201436',
      marginBottom: '0.25rem',
    }),
    fileSize: (dark) => ({
      fontSize: '0.875rem',
      color: dark ? '#bbaed6' : '#666',
      marginBottom: '0.5rem',
    }),
    progressBar: {
      width: '100%',
      height: '4px',
      background: '#e5e7eb',
      borderRadius: '2px',
      overflow: 'hidden',
      marginBottom: '0.5rem',
    },
    progressFill: (progress) => ({
      height: '100%',
      width: `${progress}%`,
      background: 'linear-gradient(90deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%)',
      transition: 'width 0.3s ease',
    }),
    removeButton: (dark) => ({
      background: 'none',
      border: 'none',
      color: '#ef4444',
      fontSize: '1.2rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '4px',
      transition: 'background 0.3s ease',
    }),
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      padding: '0.5rem',
      background: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '4px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    dragOverlay: (isDragActive) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDragActive ? 'rgba(79, 38, 131, 0.1)' : 'transparent',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#4F2683',
      opacity: isDragActive ? 1 : 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    }),
  };

  return (
    <div style={styles.container}>
      {/* Drag & Drop Zone */}
      <div
        ref={dropZoneRef}
        style={styles.dropZone(dragActive)}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.dragOverlay(dragActive)}>
          📁 Drop files here
        </div>
        
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          📄
        </div>
        
        <div style={styles.dropZoneText(dragActive)}>
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </div>
        
        <div style={styles.dropZoneSubtext}>
          or click to browse files
        </div>
        
        <div style={styles.dropZoneSubtext}>
          {multiple ? `Up to ${maxFiles} PDF files, max ${maxSizeMB}MB each` : `PDF files, max ${maxSizeMB}MB`}
        </div>
        
        <button
          type="button"
          style={styles.uploadButton(dark)}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          📁 Choose Files
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept=".pdf"
        onChange={(e) => handleFiles(e.target.files)}
        style={styles.fileInput}
      />

      {/* File List */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            color: dark ? '#e0d6f7' : '#201436'
          }}>
            Selected Files ({files.length})
          </h3>
          
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} style={styles.fileItem(dark)}>
              {/* File Preview */}
              <div style={styles.filePreview}>
                {previewUrls[file.name] ? (
                  <Document file={previewUrls[file.name]}>
                    <Page pageNumber={1} width={60} height={80} />
                  </Document>
                ) : (
                  <div style={{ fontSize: '2rem' }}>📄</div>
                )}
              </div>
              
              {/* File Info */}
              <div style={styles.fileInfo}>
                <div style={styles.fileName(dark)}>{file.name}</div>
                <div style={styles.fileSize(dark)}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                
                {/* Upload Progress */}
                {uploadProgress[file.name] !== undefined && (
                  <div style={styles.progressBar}>
                    <div style={styles.progressFill(uploadProgress[file.name] || 0)} />
                  </div>
                )}
                
                {/* Error Messages */}
                {errors[file.name] && (
                  <div style={styles.errorMessage}>
                    {errors[file.name].map((error, i) => (
                      <div key={i}>⚠️ {error}</div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                style={styles.removeButton(dark)}
                onClick={() => removeFile(file.name)}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Upload Button */}
      {files.length > 1 && (
        <button
          type="button"
          style={{
            ...styles.uploadButton(dark),
            width: '100%',
            marginTop: '1rem',
            background: '#059669',
          }}
          onClick={() => {
            files.forEach(file => simulateUpload(file.name));
          }}
        >
          🚀 Upload All Files ({files.length})
        </button>
      )}
    </div>
  );
};

export default FileUpload; 