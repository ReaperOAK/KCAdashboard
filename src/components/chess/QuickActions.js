import React from 'react';

/**
 * QuickActions - Quick start actions for PGN management
 * Uses design tokens and is fully responsive.
 */
const QuickActions = React.memo(({ onLoadSample, onUploadClick }) => (
  <section aria-label="Quick actions" className="bg-background-light dark:bg-background-dark border border-gray-light rounded-xl shadow-md p-4 sm:p-6 mb-6 transition-all duration-200">
    <h2 className="text-2xl font-semibold text-text-dark mb-4 flex items-center gap-2">
      {/* Lucide icon: LightningBolt */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      Quick Start
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onLoadSample}
        className="p-4 border border-gray-light rounded-xl hover:bg-gray-light/30 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex flex-col gap-2"
        aria-label="Load sample game"
      >
        <div className="flex items-center gap-2 font-medium text-primary">
          {/* Lucide icon: BookOpen */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v15l9-2z" /></svg>
          Load Sample Game
        </div>
        <div className="text-sm text-gray-dark">Fischer vs Spassky - World Championship 1972</div>
      </button>
      <button
        type="button"
        onClick={onUploadClick}
        className="p-4 border border-gray-light rounded-xl hover:bg-gray-light/30 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex flex-col gap-2"
        aria-label="Upload your PGN"
      >
        <div className="flex items-center gap-2 font-medium text-primary">
          {/* Lucide icon: Upload */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" /></svg>
          Upload Your PGN
        </div>
        <div className="text-sm text-gray-dark">Upload files from your computer</div>
      </button>
    </div>
  </section>
));

export default QuickActions;
