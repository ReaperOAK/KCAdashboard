
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
    <div className="flex justify-between items-center mt-4">
      <button
        type="button"
        onClick={onClear}
        className="px-4 py-2 text-gray-dark dark:text-gray-light hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Clear upload form"
      >
        Clear
      </button>
      <button
        type="button"
        onClick={onUpload}
        disabled={isUploading || validGames === 0}
        className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Upload valid games"
      >
        {uploadLabel}
      </button>
    </div>
  );
});

export default PGNUploadActions;
