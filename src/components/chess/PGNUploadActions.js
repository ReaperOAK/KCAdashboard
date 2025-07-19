
import React, { useCallback } from 'react';

export const PGNUploadActions = React.memo(function PGNUploadActions({
  handleClear,
  handleUploadToBackend,
  isUploading,
  validGames,
  totalGames,
  gamesWithErrors,
}) {
  const onClear = useCallback(() => handleClear(), [handleClear]);
  const onUpload = useCallback(() => handleUploadToBackend(), [handleUploadToBackend]);
  const uploadLabel = isUploading
    ? 'Uploading...'
    : `Upload ${validGames || totalGames - gamesWithErrors} Game(s)`;

  return (
    <div
      className="mt-4 rounded-lg p-4 flex flex-col sm:flex-row gap-3 sm:gap-6 items-center justify-between"
      role="group"
      aria-label="PGN Upload Actions"
    >
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 text-gray-dark hover:text-accent transition-all duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Clear upload form"
      >
        {/* Lucide or Heroicon: Trash */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0v10a2 2 0 002 2h4a2 2 0 002-2V7" /></svg>
        <span className="font-medium">Clear</span>
      </button>
      <button
        type="button"
        onClick={onUpload}
        disabled={isUploading || validGames === 0}
        className={`flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-secondary disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed transition-all duration-200 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isUploading ? 'opacity-80' : ''}`}
        aria-label="Upload valid games"
      >
        {/* Lucide or Heroicon: Upload */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" /></svg>
        <span>{uploadLabel}</span>
        {isUploading && (
          <svg className="animate-spin h-5 w-5 ml-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        )}
      </button>
    </div>
  );
});

export default PGNUploadActions;
