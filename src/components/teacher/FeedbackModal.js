
import React, { useEffect, useRef } from 'react';

/**
 * FeedbackModal: Beautiful, accessible, responsive modal for submitting feedback.
 * - Single responsibility: UI for feedback submission only.
 * - Uses color tokens, transitions, ARIA, and responsive layout.
 */
const FeedbackModal = React.memo(function FeedbackModal({ open, student, feedback, setFeedback, onClose, onSubmit }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-6 animate-fade-in"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-md sm:max-w-lg bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light px-4 py-6 sm:px-8 transition-all duration-300">
        <button
          aria-label="Close modal"
          onClick={onClose}
          ref={closeBtnRef}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2 text-center">Feedback</h2>
        <div className="text-base text-gray-dark mb-4 text-center font-medium">{student.name}</div>
        <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Rating</label>
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  type="button"
                  aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
                  onClick={() => setFeedback(f => ({ ...f, rating: num }))}
                  className="focus:outline-none focus:ring-2 focus:ring-accent rounded transition-colors"
                  tabIndex={0}
                >
                  <span
                    className={feedback.rating >= num ? 'text-yellow-400 drop-shadow' : 'text-gray-light'}
                    style={{ fontSize: 28, transition: 'color 0.2s' }}
                  >★</span>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-dark">{feedback.rating}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">General Feedback</label>
            <textarea
              value={feedback.comment}
              onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
              maxLength={300}
              placeholder="Share your feedback..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Areas of Improvement</label>
            <textarea
              value={feedback.areas_of_improvement}
              onChange={e => setFeedback(f => ({ ...f, areas_of_improvement: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
              maxLength={200}
              placeholder="What can be improved?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Strengths</label>
            <textarea
              value={feedback.strengths}
              onChange={e => setFeedback(f => ({ ...f, strengths: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
              maxLength={200}
              placeholder="Highlight strengths..."
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-light rounded-lg text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent font-semibold transition-all disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default FeedbackModal;
