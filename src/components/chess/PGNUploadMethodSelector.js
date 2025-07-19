
import React, { useCallback } from 'react';
import { ArrowUpTrayIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

export const PGNUploadMethodSelector = React.memo(function PGNUploadMethodSelector({ uploadMethod, setUploadMethod }) {
  const handleFileClick = useCallback(() => setUploadMethod('file'), [setUploadMethod]);
  const handleTextClick = useCallback(() => setUploadMethod('text'), [setUploadMethod]);

  return (
    <section
      className="mb-6 bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 flex flex-col gap-4"
      aria-label="PGN Upload Method Selector"
    >
      <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">Select Upload Method</h3>
      <div className="flex flex-col sm:flex-row gap-3" role="radiogroup" aria-label="Select PGN upload method">
        <button
          type="button"
          onClick={handleFileClick}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            uploadMethod === 'file'
              ? 'bg-primary text-white hover:bg-secondary'
              : 'bg-gray-light text-text-dark hover:bg-gray-200'
          }`}
          aria-checked={uploadMethod === 'file'}
          role="radio"
          aria-describedby="file-method-desc"
        >
          <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" aria-hidden="true" />
          Upload File
        </button>
        <button
          type="button"
          onClick={handleTextClick}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            uploadMethod === 'text'
              ? 'bg-primary text-white hover:bg-secondary'
              : 'bg-gray-light text-text-dark hover:bg-gray-200'
          }`}
          aria-checked={uploadMethod === 'text'}
          role="radio"
          aria-describedby="text-method-desc"
        >
          <DocumentPlusIcon className="w-5 h-5 inline mr-2" aria-hidden="true" />
          Paste Text
        </button>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span id="file-method-desc" className="text-xs text-gray-dark">Upload a PGN file from your device.</span>
        <span id="text-method-desc" className="text-xs text-gray-dark">Paste PGN text directly into the form.</span>
      </div>
    </section>
  );
});

export default PGNUploadMethodSelector;
