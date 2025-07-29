import React, { useState } from 'react';
import WorkflowProgress from './WorkflowProgress';

/**
 * ProgressDemo Component
 * 
 * This component demonstrates the WorkflowProgress component with different stages
 * and statuses. It allows users to see how the progress indicators work.
 */
const ProgressDemo = () => {
  const [currentStage, setCurrentStage] = useState('Stage0');
  const [currentStatus, setCurrentStatus] = useState('Pending');
  const [dark, setDark] = useState(false);

  const stages = [
    { id: 'Stage0', name: 'Student Submit', status: 'Pending' },
    { id: 'Stage1', name: 'Librarian Review', status: 'In Review' },
    { id: 'Stage2', name: 'Final Approval', status: 'In Review' },
    { id: 'Stage3', name: 'Published', status: 'Approved' }
  ];

  const statuses = ['Pending', 'In Review', 'Approved', 'Returned'];

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
          Workflow Progress Demo
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: dark ? '#bbaed6' : '#666',
          marginBottom: '2rem',
        }}>
          Interactive demonstration of document workflow progress tracking
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

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '3rem',
        flexWrap: 'wrap',
      }}>
        {/* Stage Selector */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: dark ? '#e0d6f7' : '#201436',
          }}>
            Current Stage:
          </label>
          <select
            value={currentStage}
            onChange={(e) => setCurrentStage(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
              background: dark ? '#2a1a3a' : '#fff',
              color: dark ? '#e0d6f7' : '#201436',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {stages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: dark ? '#e0d6f7' : '#201436',
          }}>
            Current Status:
          </label>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: `1px solid ${dark ? '#4F2683' : '#bbaed6'}`,
              background: dark ? '#2a1a3a' : '#fff',
              color: dark ? '#e0d6f7' : '#201436',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Display */}
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
        <WorkflowProgress 
          currentStage={currentStage}
          status={currentStatus}
          dark={dark}
          showTimeline={true}
        />
      </div>

      {/* Feature List */}
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
              📊 Progress Bar
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Visual progress indicator showing completion percentage through the workflow stages.
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
              🏷️ Status Badges
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Color-coded status indicators for Pending, In Review, Approved, and Returned states.
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
              📅 Timeline View
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: dark ? '#bbaed6' : '#666',
              margin: 0,
            }}>
              Step-by-step timeline showing the document's journey through all workflow stages.
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
    </div>
  );
};

export default ProgressDemo; 