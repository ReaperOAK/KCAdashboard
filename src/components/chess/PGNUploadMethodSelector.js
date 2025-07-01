
import React, { useCallback } from 'react';
import { ArrowUpTrayIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

export const PGNUploadMethodSelector = React.memo(function PGNUploadMethodSelector({ uploadMethod, setUploadMethod }) {
  const handleFileClick = useCallback(() => setUploadMethod('file'), [setUploadMethod]);
  const handleTextClick = useCallback(() => setUploadMethod('text'), [setUploadMethod]);

  return (
    <div className="mb-6">
      <div className="flex space-x-4" role="radiogroup" aria-label="Select PGN upload method">
        <button
          type="button"
          onClick={handleFileClick}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            uploadMethod === 'file'
              ? 'bg-primary text-white hover:bg-secondary'
              : 'bg-gray-light dark:bg-gray-dark text-text-dark dark:text-text-light hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-checked={uploadMethod === 'file'}
          role="radio"
        >
          <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" aria-hidden="true" />
          Upload File
        </button>
        <button
          type="button"
          onClick={handleTextClick}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            uploadMethod === 'text'
              ? 'bg-primary text-white hover:bg-secondary'
              : 'bg-gray-light dark:bg-gray-dark text-text-dark dark:text-text-light hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-checked={uploadMethod === 'text'}
          role="radio"
        >
          <DocumentPlusIcon className="w-5 h-5 inline mr-2" aria-hidden="true" />
          Paste Text
        </button>
      </div>
    </div>
  );
});

export default PGNUploadMethodSelector;
