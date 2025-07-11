import React from 'react';

/**
 * QuickActions - Quick start actions for PGN management
 * Uses design tokens and is fully responsive.
 */
const QuickActions = React.memo(({ onLoadSample, onUploadClick }) => (
  <section aria-label="Quick actions" className="bg-background-light dark:bg-background-dark border border-gray-light rounded-lg shadow p-4 sm:p-6 mb-6 transition-all duration-200">
    <h2 className="text-lg sm:text-xl font-semibold text-primary">Quick Start</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onLoadSample}
        className="p-3 sm:p-4 border border-gray-light rounded-lg hover:bg-gray-light/30 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Load sample game"
      >
        <div className="font-medium text-primary">Load Sample Game</div>
        <div className="text-sm text-gray-dark">Fischer vs Spassky - World Championship 1972</div>
      </button>
      <button
        type="button"
        onClick={onUploadClick}
        className="p-3 sm:p-4 border border-gray-light rounded-lg hover:bg-gray-light/30 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Upload your PGN"
      >
        <div className="font-medium text-primary">Upload Your PGN</div>
        <div className="text-sm text-gray-dark">Upload files from your computer</div>
      </button>
    </div>
  </section>
));

export default QuickActions;
