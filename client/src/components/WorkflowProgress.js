import React from 'react';

/**
 * WorkflowProgress Component
 * 
 * This component provides visual indicators for document workflow progress including:
 * - Progress bar showing completion percentage
 * - Status badges for current stage
 * 
 * @param {string} currentStage - Current stage of the document (Stage0, Stage1, Stage2, Stage3)
 * @param {string} status - Current status (Pending, In Review, Approved, Returned)
 * @param {boolean} dark - Dark/light theme state
 */
const WorkflowProgress = ({ currentStage, status, dark }) => {
  // Define workflow stages and their properties
  const stages = [
    { id: 'Stage0', name: 'Student Submit', description: 'Initial submission by student' },
    { id: 'Stage1', name: 'Librarian Review', description: 'Librarian review and validation' },
    { id: 'Stage2', name: 'Final Approval', description: 'Final review and approval' },
    { id: 'Stage3', name: 'Published', description: 'Document published to repository' }
  ];

  // Calculate progress percentage based on current stage
  const getProgressPercentage = () => {
    const stageIndex = stages.findIndex(stage => stage.id === currentStage);
    if (stageIndex === -1) return 0;
    return ((stageIndex + 1) / stages.length) * 100;
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: "'BentonSans Book', sans-serif",
    };

    const statusStyles = {
      'Pending': {
        background: dark ? '#3b82f6' : '#dbeafe',
        color: dark ? '#bfdbfe' : '#1e40af',
        border: `2px solid ${dark ? '#60a5fa' : '#3b82f6'}`,
      },
      'In Review': {
        background: dark ? '#f59e0b' : '#fef3c7',
        color: dark ? '#fde68a' : '#92400e',
        border: `2px solid ${dark ? '#fbbf24' : '#f59e0b'}`,
      },
      'Approved': {
        background: dark ? '#10b981' : '#d1fae5',
        color: dark ? '#a7f3d0' : '#065f46',
        border: `2px solid ${dark ? '#34d399' : '#10b981'}`,
      },
      'Returned': {
        background: dark ? '#ef4444' : '#fee2e2',
        color: dark ? '#fca5a5' : '#991b1b',
        border: `2px solid ${dark ? '#f87171' : '#ef4444'}`,
      }
    };

    return { ...baseStyle, ...statusStyles[status] };
  };

  // Styles object for the component
  const styles = {
    container: {
      width: '100%',
      marginBottom: '2rem',
    },
    progressContainer: {
      marginBottom: '1.5rem',
    },
    progressBar: (dark) => ({
      width: '100%',
      height: '12px',
      backgroundColor: dark ? '#374151' : '#e5e7eb',
      borderRadius: '6px',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '0.5rem',
    }),
    progressFill: (dark, percentage) => ({
      height: '100%',
      background: dark 
        ? 'linear-gradient(90deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%)'
        : 'linear-gradient(90deg, #4F2683 0%, #7c3aed 50%, #a855f7 100%)',
      borderRadius: '6px',
      width: `${percentage}%`,
      transition: 'width 0.5s ease-in-out',
      position: 'relative',
    }),
    progressText: (dark) => ({
      textAlign: 'center',
      fontSize: '0.875rem',
      color: dark ? '#9ca3af' : '#6b7280',
      fontFamily: "'BentonSans Book', sans-serif",
      marginTop: '0.5rem',
    }),
    statusContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem',
    },
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div style={styles.container}>
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar(dark)}>
          <div style={styles.progressFill(dark, progressPercentage)} />
        </div>
        <div style={styles.progressText(dark)}>
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Status Badge */}
      <div style={styles.statusContainer}>
        <div style={getStatusBadgeStyle(status)}>
          {status === 'Pending' && '⏳'}
          {status === 'In Review' && '🔍'}
          {status === 'Approved' && '✅'}
          {status === 'Returned' && '↩️'}
          {status}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress; 