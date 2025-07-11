import React from 'react';

const DeleteQuizModal = React.memo(({ open, quiz, onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">Delete Quiz</h2>
        <p className="mb-6 text-gray-dark">
          Are you sure you want to delete "{quiz?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-light rounded-md text-gray-dark hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default DeleteQuizModal;
