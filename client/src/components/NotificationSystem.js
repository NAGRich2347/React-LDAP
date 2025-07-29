// --- NotificationSystem.js ---
// React component for the notification system of the workflow.
// Provides real-time notifications for document status changes, returns, and approvals.
// Supports swipe-to-dismiss gestures and role-based notification filtering.
// Enhanced with Apple-style notification badges and improved UI.
// Real-time updates with dynamic refresh functionality.

import React, { useState, useEffect, useRef } from 'react';

/**
 * NotificationSystem Component
 * 
 * This component provides real-time notifications for the PDF workflow system.
 * It monitors localStorage for new notifications and displays them based on user role.
 * 
 * Features:
 * - Role-based notification filtering
 * - Real-time updates (checks every 1 second for immediate responsiveness)
 * - Auto-dismiss after 15 seconds
 * - Swipe-to-dismiss gestures
 * - Click to open documents
 * - Dark/light theme support
 * - Smooth animations and transitions
 * - Apple-style notification badges
 * - Dynamic real-time refresh of notification counts
 * - Live workflow status updates
 * 
 * @param {boolean} dark - Dark/light theme state
 * @param {function} onOpenDocument - Callback function when document is clicked
 * @param {function} onNotificationUpdate - Callback function when notifications change
 */
const NotificationSystem = ({ dark, onOpenDocument, onNotificationUpdate }) => {
  // State management for notifications and UI interactions
  const [notifications, setNotifications] = useState([]); // Current notifications to display
  const [swipeStates, setSwipeStates] = useState({}); // Touch/swipe state for each notification
  const [notificationCounts, setNotificationCounts] = useState({}); // Real-time counts for different categories
  const notificationRefs = useRef({}); // Refs to notification DOM elements for animations
  const lastUpdateRef = useRef(0); // Track last update time to prevent unnecessary re-renders

  // Real-time notification monitoring - check every 1 second for immediate responsiveness
  useEffect(() => {
    const checkForNotifications = () => {
      const currentTime = Date.now();
      const storedNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]'); // Get all notifications
      const currentUser = atob(sessionStorage.getItem('authUser') || ''); // Get current user
      const currentRole = atob(sessionStorage.getItem('authRole') || ''); // Get current role
      
      // Get shown notification IDs for this user from sessionStorage
      const shownKey = `shownNotifications_${currentUser}`;
      const shownIds = JSON.parse(sessionStorage.getItem(shownKey) || '[]');
      // Get persistently read notification IDs for this user from localStorage
      const readKey = `readNotifications_${currentUser}`;
      const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');
      
      // Filter notifications based on user role and target stage
      const userNotifications = storedNotifications.filter(notification => {
        // Students see notifications for documents returned to them (Stage0)
        if (currentRole === 'student' && notification.targetUser === currentUser && notification.targetStage === 'Stage0') {
          return true;
        }
        // Librarians see notifications for documents in their review stage (Stage1)
        if (currentRole === 'librarian' && notification.targetStage === 'Stage1') {
          return true;
        }
        // Reviewers see notifications for documents in final approval stage (Stage2)
        if (currentRole === 'reviewer' && notification.targetStage === 'Stage2') {
          return true;
        }
        return false;
      })
      // Filter out notifications that have been persistently read
      .filter(notification => !readIds.includes(notification.id));
      
      // Only show notifications that have not been shown in this session
      const newNotifications = userNotifications.filter(notification =>
        !shownIds.includes(notification.id) && !notifications.find(n => n.id === notification.id)
      );
      
      // Update notification counts for real-time badge updates
      const counts = {
        total: userNotifications.length,
        new: newNotifications.length,
        unread: userNotifications.filter(n => !shownIds.includes(n.id)).length
      };
      
      // Only update if there are actual changes to prevent unnecessary re-renders
      if (newNotifications.length > 0 || JSON.stringify(counts) !== JSON.stringify(notificationCounts)) {
        setNotificationCounts(counts);
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newNotifications]); // Add new notifications to state
          // Mark these notifications as shown in sessionStorage
          const updatedShown = [...shownIds, ...newNotifications.map(n => n.id)];
          sessionStorage.setItem(shownKey, JSON.stringify(updatedShown));
          
          // Notify parent component of notification update
          if (onNotificationUpdate) {
            onNotificationUpdate(counts);
          }
        }
        
        lastUpdateRef.current = currentTime;
      }
    };
    
    checkForNotifications(); // Run immediately on mount
    const interval = setInterval(checkForNotifications, 1000); // Check every 1 second for real-time updates
    
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [notifications, notificationCounts, onNotificationUpdate]);

  // Monitor workflow changes in real-time
  useEffect(() => {
    const checkWorkflowChanges = () => {
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
      const currentUser = atob(sessionStorage.getItem('authUser') || '');
      const currentRole = atob(sessionStorage.getItem('authRole') || '');
      
      // Calculate real-time counts based on current workflow state
      let workflowCounts = {};
      
      if (currentRole === 'librarian') {
        workflowCounts = {
          toReview: submissions.filter(s => s.stage === 'Stage1' && !s.returnedFromReview).length,
          returned: submissions.filter(s => s.stage === 'Stage1' && s.returnedFromReview).length,
          sent: submissions.filter(s => s.stage === 'Stage2' && s.filename.includes(currentUser)).length,
          sentBack: submissions.filter(s => s.stage === 'Stage0' && s.sentBackBy === currentUser).length
        };
      } else if (currentRole === 'reviewer') {
        workflowCounts = {
          toReview: submissions.filter(s => s.stage === 'Stage2' && !s.returnedFromReview).length,
          returned: submissions.filter(s => s.stage === 'Stage2' && s.returnedFromReview).length,
          sent: submissions.filter(s => s.stage === 'Stage3' && s.filename.includes(currentUser)).length,
          sentBack: submissions.filter(s => s.stage === 'Stage1' && s.sentBackBy === currentUser).length
        };
      }
      
      // Update notification counts with workflow data
      setNotificationCounts(prev => ({
        ...prev,
        workflow: workflowCounts
      }));
      
      // Notify parent component of workflow changes
      if (onNotificationUpdate) {
        onNotificationUpdate({
          ...notificationCounts,
          workflow: workflowCounts
        });
      }
    };
    
    checkWorkflowChanges(); // Run immediately
    const workflowInterval = setInterval(checkWorkflowChanges, 2000); // Check workflow every 2 seconds
    
    return () => clearInterval(workflowInterval);
  }, [onNotificationUpdate, notificationCounts]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timeouts = notifications.map(notification => {
      return setTimeout(() => {
        removeNotification(notification.id); // Remove notification after timeout
      }, 5000); // 5 second timeout
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout)); // Cleanup timeouts on unmount
  }, [notifications]);

  /**
   * Remove a notification by ID
   * 
   * @param {string} id - The notification ID to remove
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id)); // Remove from notifications array
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[id]; // Clean up swipe state
      return newState;
    });
    
    // Update counts after removal
    setNotificationCounts(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      unread: Math.max(0, prev.unread - 1)
    }));
    // Persistently mark as read
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    const readKey = `readNotifications_${currentUser}`;
    const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');
    if (!readIds.includes(id)) {
      localStorage.setItem(readKey, JSON.stringify([...readIds, id]));
    }
  };

  /**
   * Handle swipe gestures on notifications
   * 
   * @param {string} id - The notification ID
   * @param {string} direction - The swipe direction ('up', 'down', 'left', 'right')
   */
  const handleSwipe = (id, direction) => {
    if (direction === 'up') {
      removeNotification(id); // Remove notification on upward swipe
    }
  };

  /**
   * Handle click on notification
   * 
   * @param {Object} notification - The notification object
   */
  const handleClick = (notification) => {
    if (onOpenDocument && notification.filename) {
      onOpenDocument(notification.filename); // Call parent callback to open document
    }
    removeNotification(notification.id); // Remove notification after click and mark as read
  };

  /**
   * Handle touch start event for swipe detection
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchStart = (id, e) => {
    const touch = e.touches[0]; // Get first touch point
    setSwipeStates(prev => ({
      ...prev,
      [id]: { startY: touch.clientY, startTime: Date.now() } // Store initial touch position and time
    }));
  };

  /**
   * Handle touch move event for swipe animation
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchMove = (id, e) => {
    const touch = e.touches[0]; // Get current touch point
    const swipeState = swipeStates[id]; // Get stored swipe state
    
    if (swipeState) {
      const deltaY = swipeState.startY - touch.clientY; // Calculate vertical distance
      const element = notificationRefs.current[id]; // Get notification DOM element
      
      if (element && deltaY > 50) {
        element.style.transform = `translateY(-${deltaY}px)`; // Move element up
        element.style.opacity = Math.max(0, 1 - deltaY / 100); // Fade out based on distance
      }
    }
  };

  /**
   * Handle touch end event to determine if swipe should trigger dismissal
   * 
   * @param {string} id - The notification ID
   * @param {TouchEvent} e - The touch event
   */
  const handleTouchEnd = (id, e) => {
    const swipeState = swipeStates[id]; // Get stored swipe state
    const element = notificationRefs.current[id]; // Get notification DOM element
    
    if (swipeState && element) {
      const deltaY = swipeState.startY - e.changedTouches[0].clientY; // Calculate final distance
      const deltaTime = Date.now() - swipeState.startTime; // Calculate swipe duration
      
      // Dismiss if swiped up far enough or fast enough
      if (deltaY > 80 || (deltaY > 50 && deltaTime < 300)) {
        handleSwipe(id, 'up'); // Trigger swipe dismissal
      } else {
        element.style.transform = ''; // Reset position
        element.style.opacity = ''; // Reset opacity
      }
    }
  };

  /**
   * Test function to add a sample notification (for development/testing)
   * This can be called from the browser console to test the notification system
   */
  const addTestNotification = () => {
    const testNotification = {
      id: `test-${Date.now()}`,
      filename: 'Test_Document.pdf',
      targetUser: atob(sessionStorage.getItem('authUser') || ''),
      targetStage: 'Stage1',
      timestamp: Date.now()
    };
    
    const currentNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    currentNotifications.push(testNotification);
    localStorage.setItem('userNotifications', JSON.stringify(currentNotifications));
    
    console.log('Test notification added! Check the notification system.');
  };

  /**
   * Test function to simulate workflow changes (for development/testing)
   * This can be called from the browser console to test real-time updates
   */
  const simulateWorkflowChange = () => {
    const currentUser = atob(sessionStorage.getItem('authUser') || '');
    const currentRole = atob(sessionStorage.getItem('authRole') || '');
    
    // Get current submissions
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    
    // Create a test submission
    const testSubmission = {
      filename: `Test_${currentUser}_${Date.now()}.pdf`,
      stage: currentRole === 'librarian' ? 'Stage1' : 'Stage2',
      time: Date.now(),
      user: currentUser,
      content: 'test-content',
      returnedFromReview: false
    };
    
    // Add to submissions
    submissions.push(testSubmission);
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    console.log('Workflow change simulated! Check the notification badges for real-time updates.');
    console.log('Current workflow counts:', notificationCounts.workflow);
  };

  // Expose test functions globally for development
  if (typeof window !== 'undefined') {
    window.addTestNotification = addTestNotification;
    window.simulateWorkflowChange = simulateWorkflowChange;
    window.notificationCounts = notificationCounts; // Expose counts for debugging
    window.getNotificationStats = () => ({
      counts: notificationCounts,
      notifications: notifications.length,
      lastUpdate: lastUpdateRef.current
    });
  }

  /**
   * NotificationSystem Component - Comprehensive Styling Object
   * 
   * This object contains all the styling for the notification system.
   * Each style function takes theme parameters (dark/light mode) and returns
   * appropriate CSS properties for responsive, accessible design.
   * Enhanced with Apple-style notification design patterns.
   */
  const styles = {
    // Container for all notifications with fixed positioning
    notificationContainer: {
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)', // Center horizontally
      zIndex: 10000, // High z-index to appear above other content
      display: 'flex',
      flexDirection: 'column',
      gap: 10, // Space between notifications
      pointerEvents: 'none', // Allow clicks to pass through container
    },
    // Individual notification styling with Apple-inspired design
    notification: (dark, isVisible) => ({
      background: dark ? 'rgba(36, 18, 54, 0.98)' : 'rgba(255, 255, 255, 0.98)', // More opaque background
      border: `1px solid ${dark ? '#4F2683' : '#e1e5e9'}`, // Subtle border
      borderRadius: 16, // More rounded corners like Apple
      padding: '20px 24px', // Increased padding
      minWidth: 320, // Slightly wider
      maxWidth: 420, // Maximum width
      boxShadow: dark 
        ? '0 12px 40px rgba(79, 38, 131, 0.25), 0 4px 16px rgba(0, 0, 0, 0.2)' 
        : '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)', // Enhanced shadow
      color: dark ? '#e0d6f7' : '#201436', // Theme-based text color
      fontFamily: "'BentonSans Book', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: '14px',
      lineHeight: 1.5,
      cursor: 'pointer', // Indicate clickable
      pointerEvents: 'auto', // Enable clicks on notification
      transform: isVisible ? 'translateY(0)' : 'translateY(-100px)', // Slide in/out animation
      opacity: isVisible ? 1 : 0, // Fade in/out
      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth Apple-style transitions
      backdropFilter: 'blur(20px)', // Enhanced background blur effect
      borderLeft: `4px solid #ff3b30`, // Apple-style red accent border
      position: 'relative', // For badge positioning
    }),
    // Header section with title and close button
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12, // Increased spacing
    },
    // Notification title styling with Apple typography
    title: (dark) => ({
      fontWeight: 600,
      fontSize: '16px',
      color: dark ? '#e0d6f7' : '#201436',
      margin: 0,
      letterSpacing: '-0.2px', // Apple-style letter spacing
    }),
    // Close button styling with Apple design
    closeButton: (dark) => ({
      background: 'none',
      border: 'none',
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '20px',
      cursor: 'pointer',
      padding: 4,
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.2s ease',
      opacity: 0.7,
      '&:hover': {
        backgroundColor: dark ? 'rgba(224, 214, 247, 0.15)' : 'rgba(32, 20, 54, 0.1)',
        opacity: 1,
      },
    }),
    // Notification message styling
    message: (dark) => ({
      margin: 0,
      color: dark ? '#e0d6f7' : '#201436',
      fontSize: '14px',
      lineHeight: 1.5,
      opacity: 0.9,
    }),
    // Swipe hint text styling
    swipeHint: (dark) => ({
      fontSize: '12px',
      color: dark ? 'rgba(224, 214, 247, 0.6)' : 'rgba(32, 20, 54, 0.6)',
      marginTop: 12,
      textAlign: 'center',
      fontStyle: 'italic',
      opacity: 0.8,
    }),
    // Apple-style notification badge
    notificationBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      background: '#ff3b30', // Apple red
      color: '#ffffff',
      borderRadius: '50%',
      minWidth: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 600,
      border: '2px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px rgba(255, 59, 48, 0.3)',
      zIndex: 1,
      animation: 'badgePulse 2s ease-in-out infinite',
    },
    // Badge pulse animation
    '@keyframes badgePulse': {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.1)' },
    },
  };

  return (
    <div style={styles.notificationContainer}>
      <style>
        {`
          @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          ref={el => notificationRefs.current[notification.id] = el}
          style={styles.notification(dark, true)}
          onClick={() => handleClick(notification)}
          onTouchStart={(e) => handleTouchStart(notification.id, e)}
          onTouchMove={(e) => handleTouchMove(notification.id, e)}
          onTouchEnd={(e) => handleTouchEnd(notification.id, e)}
        >
          {/* Apple-style notification badge */}
          <div style={styles.notificationBadge}>
            {Math.min(notifications.length, 999)}
          </div>
          
          <div style={styles.header}>
            <h4 style={styles.title(dark)}>📄 Document Returned</h4>
            <button
              style={styles.closeButton(dark)}
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = dark ? 'rgba(224, 214, 247, 0.15)' : 'rgba(32, 20, 54, 0.1)';
                e.target.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.opacity = '0.7';
              }}
            >
              ×
            </button>
          </div>
          <p style={styles.message(dark)}>
            {notification.filename} has been sent back to you for review.
          </p>
          <p style={styles.swipeHint(dark)}>
            Tap to open • Swipe up to dismiss
          </p>
          <p style={{
            fontSize: '11px',
            color: dark ? 'rgba(224, 214, 247, 0.5)' : 'rgba(32, 20, 54, 0.5)',
            marginTop: 4,
            marginBottom: 0,
            textAlign: 'center',
            fontStyle: 'italic',
            opacity: 0.7,
          }}>
            (auto-dismisses in 15s)
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem; 