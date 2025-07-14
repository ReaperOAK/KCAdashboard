import React, { memo } from 'react';
// TODO: Replace with Lucide or Heroicons for production
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ModalHeader = memo(function ModalHeader({ onClose, title }) {
  return (
    <div className="flex justify-between items-center mb-2 sm:mb-4 px-1 sm:px-2">
      <h2
        className="text-2xl sm:text-3xl font-semibold text-text-dark tracking-tight leading-tight"
        aria-label={title}
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full text-gray-dark hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        aria-label="Close modal"
        tabIndex={0}
      >
        <CloseIcon />
      </button>
    </div>
  );
});

export default ModalHeader;
