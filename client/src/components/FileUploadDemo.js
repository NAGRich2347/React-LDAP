import React, { useState } from 'react';
import FileUpload from './FileUpload';

/**
 * FileUploadDemo Component
 * 
 * This component demonstrates the advanced file upload features including:
 * - Drag & drop with visual feedback
 * - PDF thumbnail preview
 * - File validation with helpful error messages
 * - Bulk file upload support
 * - Progress indicators
 */
const FileUploadDemo = () => {
  const [files, setFiles] = useState([]);
  const [dark, setDark] = useState(false);
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'multiple'

  return (
    <div style={{
      fontFamily: "'BentonSans Book', sans-serif",
      minHeight: '100vh',
      background: dark ? '#1e1e1e' : '#f1f1f1',
      color: dark ? '#fff' : '#201436',
      padding: '2rem',
      transition: 'background .3s,color .3s',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: dark ? '#e0d6f7' : '#201436',
        }}>
          Advanced File Upload Demo
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: dark ? '#bbaed6' : '#666',
          marginBottom: '2rem',
        }}>
          Experience the next-generation file upload with drag & drop, previews, and validation
        </p>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          style={{
            padding: '0.75rem 1.5rem',
            background: dark ? '#4F2683' : '#a259e6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '2rem',
          }}
        >
          {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Upload Mode Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3rem',
      }}>
        <button
          onClick={() => setUploadMode('single')}
          style={{
            padding: '0.75rem 1.5rem',
            background: uploadMode === 'single' ? '#4F2683' : (dark ? '#2a1a3a' : '#e5e7eb'),
            color: uploadMode === 'single' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          📄 Single File
        </button>
        <button
          onClick={() => setUploadMode('multiple')}
          style={{
            padding: '0.75rem 1.5rem',
            background: uploadMode === 'multiple' ? '#4F2683' : (dark ? '#2a1a3a' : '#e5e7eb'),
            color: uploadMode === 'multiple' ? '#fff' : (dark ? '#e0d6f7' : '#201436'),
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          📚 Multiple Files
        </button>
      </div>

      {/* File Upload Component */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: dark
          ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
          : '0 4px 32px rgba(80,40,130,0.10)',
      }}>
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          dark={dark}
          multiple={uploadMode === 'multiple'}
          maxFiles={uploadMode === 'multiple' ? 5 : 1}
          maxSizeMB={10}
        />
      </div>

      {/* Feature Showcase */}
      <div style={{
        maxWidth: '800px',
        margin: '3rem auto 0 auto',
        background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: dark
          ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
          : '0 4px 32px rgba(80,40,130,0.10)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1.5rem',
          color: dark ? '#e0d6f7' : '#201436',
          textAlign: 'center',
        }}>
          Features Included
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              🖱️ Drag & Drop
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Intuitive drag and drop interface with visual feedback and smooth animations.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              👁️ PDF Preview
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Instant PDF thumbnail previews showing the first page of each document.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              ✅ Smart Validation
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Real-time file validation with helpful error messages for type and size.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              📚 Bulk Upload
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Upload multiple files at once with progress tracking and batch processing.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              📊 Progress Tracking
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Visual progress indicators for each file upload with real-time feedback.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            background: dark ? 'rgba(79, 38, 131, 0.1)' : 'rgba(79, 38, 131, 0.05)',
            borderRadius: '8px',
            border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              🌓 Theme Support
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Full dark/light theme support with smooth transitions and consistent styling.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto 0 auto',
        background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255,255,255,0.98)',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: dark
          ? '0 8px 40px 0 rgba(79,38,131,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.18)'
          : '0 4px 32px rgba(80,40,130,0.10)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: dark ? '#e0d6f7' : '#201436',
          textAlign: 'center',
        }}>
          How to Test
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          <div>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              🖱️ Drag & Drop Test
            </h3>
            <ul style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
              paddingLeft: '1.5rem',
            }}>
              <li>Drag a PDF file over the upload area</li>
              <li>Watch the visual feedback change</li>
              <li>Drop the file to see it added to the list</li>
            </ul>
          </div>

          <div>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              ✅ Validation Test
            </h3>
            <ul style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
              paddingLeft: '1.5rem',
            }}>
              <li>Try uploading a non-PDF file</li>
              <li>Try uploading a file larger than 10MB</li>
              <li>See helpful error messages appear</li>
            </ul>
          </div>

          <div>
            <h3 style={{
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              color: dark ? '#e0d6f7' : '#201436',
            }}>
              📚 Bulk Upload Test
            </h3>
            <ul style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
              paddingLeft: '1.5rem',
            }}>
              <li>Switch to "Multiple Files" mode</li>
              <li>Select multiple PDF files</li>
              <li>Click "Upload All Files" to see progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo; 