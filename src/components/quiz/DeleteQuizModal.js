
import React from 'react';

/**
 * DeleteQuizModal: Modal for confirming quiz deletion.
 * - Beautiful, accessible, responsive, single-responsibility.
 */
const DeleteQuizModal = React.memo(function DeleteQuizModal({ open, quiz, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 sm:px-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-quiz-title"
      aria-describedby="delete-quiz-desc"
    >
      <div className="bg-white dark:bg-background-dark rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6  border border-gray-light">
        <h2 id="delete-quiz-title" className="text-2xl font-semibold text-primary mb-2 text-center">
          Delete Quiz
        </h2>
        <p id="delete-quiz-desc" className="mb-6 text-gray-dark text-center text-base sm:text-lg">
          Are you sure you want to delete <span className="font-semibold text-accent">"{quiz?.title}"</span>?<br className="hidden sm:block" /> This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-light text-gray-dark bg-background-light hover:bg-gray-light hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 font-medium"
            aria-label="Cancel delete quiz"
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-highlight text-white hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight transition-all duration-200 font-semibold shadow-sm"
            aria-label="Confirm delete quiz"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default DeleteQuizModal;
