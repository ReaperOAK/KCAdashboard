
import React, { useEffect, useCallback, memo } from 'react';

// Modal header (memoized)
const ModalHeader = memo(function ModalHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center border-b p-4">
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        aria-label="Close modal"
        type="button"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});

function Modal({ title, children, onClose }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Prevent clicks inside modal from closing it
  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Prevent focus trap loss
  useEffect(() => {
    const modal = document.getElementById('modal-root');
    if (modal) modal.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        id="modal-root"
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto animate-fade-in focus:outline-none"
        onClick={handleModalClick}
        tabIndex={-1}
      >
        <ModalHeader title={title} onClose={onClose} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default memo(Modal);
