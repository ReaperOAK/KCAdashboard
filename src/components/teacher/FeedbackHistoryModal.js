
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
 * FeedbackHistoryModal: Beautiful, accessible, responsive modal for feedback history.
 * - Single responsibility: UI for feedback history only.
 * - Uses color tokens, transitions, ARIA, and responsive layout.
 */
const FeedbackHistoryModal = React.memo(function FeedbackHistoryModal({ open, student, feedbackHistory, onClose }) {
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
      <div className="relative w-full max-w-2xl sm:max-w-3xl bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light px-4 py-6 sm:px-8 max-h-[80vh] overflow-y-auto transition-all duration-300">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center flex-1">Feedback History</h2>
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
        {feedbackHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[120px]">
            <p className="text-gray-dark text-center py-8">No feedback history available</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-4 py-2 border border-gray-light rounded-lg text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbackHistory.map((feedback) => (
              <div key={feedback.id} className="border-b border-gray-light pb-6 last:border-b-0 bg-white/80 rounded-xl shadow-sm px-3 py-4 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <span className="font-medium text-gray-dark text-sm">{formatDate(feedback.created_at)}</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                </div>
                {feedback.comment && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-primary mb-1">General Feedback:</h4>
                    <p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.comment}</p>
                  </div>
                )}
                {feedback.strengths && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-primary mb-1">Strengths:</h4>
                    <p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.strengths}</p>
                  </div>
                )}
                {feedback.areas_of_improvement && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-primary mb-1">Areas for Improvement:</h4>
                    <p className="text-sm text-gray-dark bg-background-light rounded px-2 py-1">{feedback.areas_of_improvement}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default FeedbackHistoryModal;
