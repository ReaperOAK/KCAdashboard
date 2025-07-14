
import React, { useEffect, useRef } from 'react';

// Utility: format date (SRP)
function formatDate(dateString) {
  return dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
}

// Utility: get rating color (SRP)
function getRatingColor(rating) {
  if (rating >= 4.5) return 'bg-accent text-white';
  if (rating >= 3.5) return 'bg-secondary text-white';
  if (rating >= 2.5) return 'bg-warning text-white';
  return 'bg-error text-white';
}

/**
 * PerformanceModal: Beautiful, accessible, responsive modal for student performance.
 * - Single responsibility: UI for performance summary only.
 * - Uses color tokens, transitions, ARIA, and responsive layout.
 */
const PerformanceModal = React.memo(function PerformanceModal({ open, student, performanceData, selectedTimeframe, onTimeframeChange, onClose }) {
  const closeBtnRef = useRef(null);

  // Accessibility: trap focus, close on Escape
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-6 "
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-3xl sm:max-w-4xl bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light px-4 py-6 sm:px-8 max-h-[90vh] overflow-y-auto transition-all duration-300">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center flex-1">Performance</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            ref={closeBtnRef}
            className="text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="text-base text-gray-dark mb-4 text-center font-medium">{student.name}</div>
        {/* Time frame selector */}
        <div className="flex flex-wrap gap-2 mb-6 items-center justify-center">
          <span className="text-gray-dark">Time Period:</span>
          {['week', 'month', 'quarter', 'year'].map(period => (
            <button
              key={period}
              type="button"
              onClick={() => onTimeframeChange(period)}
              className={`px-3 py-1 text-sm rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${selectedTimeframe === period ? 'bg-secondary text-white shadow' : 'bg-gray-light text-primary hover:bg-accent hover:text-white'}`}
              aria-pressed={selectedTimeframe === period}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        {!performanceData ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-dark">Loading...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-gray-light shadow-md">
              <h3 className="text-lg font-medium text-primary mb-4">Attendance Summary</h3>
              {performanceData.attendance ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-xl text-center border border-gray-light shadow-sm">
                    <div className="text-2xl font-bold text-secondary">{performanceData.attendance.present || 0}</div>
                    <div className="text-sm text-gray-dark">Present</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl text-center border border-gray-light shadow-sm">
                    <div className="text-2xl font-bold text-error">{performanceData.attendance.absent || 0}</div>
                    <div className="text-sm text-gray-dark">Absent</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl text-center border border-gray-light shadow-sm">
                    <div className="text-2xl font-bold text-warning">{performanceData.attendance.late || 0}</div>
                    <div className="text-sm text-gray-dark">Late</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl text-center border border-gray-light shadow-sm">
                    <div className="text-2xl font-bold text-info">{performanceData.attendance.rate || 0}%</div>
                    <div className="text-sm text-gray-dark">Attendance Rate</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-dark text-center py-4">No attendance data available</p>
              )}
            </div>
            <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-gray-light shadow-md">
              <h3 className="text-lg font-medium text-primary mb-4">Quiz Performance Summary</h3>
              {performanceData.quiz_performance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-gray-light shadow-sm text-center">
                    <div className="text-2xl font-bold text-secondary">{performanceData.quiz_performance.average || 0}</div>
                    <div className="text-sm text-gray-dark">Average Score</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-light shadow-sm text-center">
                    <div className="text-2xl font-bold text-info">{performanceData.quiz_performance.count || 0}</div>
                    <div className="text-sm text-gray-dark">Total Quizzes</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-dark text-center py-4">No quiz performance data available</p>
              )}
            </div>
            {/* Recent Feedback */}
            <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl border border-gray-light shadow-md">
              <h3 className="text-lg font-medium text-primary mb-4">Recent Teacher Feedback</h3>
              {performanceData.feedback && performanceData.feedback.length > 0 ? (
                <div className="space-y-4">
                  {performanceData.feedback.map((feedback) => (
                    <div key={feedback.id} className="bg-white p-4 rounded-xl border border-gray-light shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                        <span className="text-sm text-gray-dark">By {feedback.teacher_name} on {formatDate(feedback.created_at)}</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                      </div>
                      {feedback.comment && (<div className="mb-2"><h5 className="text-sm font-medium text-primary mb-1">Comment:</h5><p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.comment}</p></div>)}
                      {feedback.strengths && (<div className="mb-2"><h5 className="text-sm font-medium text-primary mb-1">Strengths:</h5><p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.strengths}</p></div>)}
                      {feedback.areas_of_improvement && (<div><h5 className="text-sm font-medium text-primary mb-1">Areas for Improvement:</h5><p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.areas_of_improvement}</p></div>)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-dark text-center py-4">No recent feedback available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PerformanceModal;
