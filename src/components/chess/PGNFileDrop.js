import React, { useCallback, useMemo } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

function FileDropArea({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  children
}) {
  // Memoize drop area classes for performance and color contrast
  const dropAreaClasses = useMemo(
    () =>
      `rounded-lg  p-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging
          ? 'bg-accent/10'
          : ''
      }`,
    [isDragging]
  );
  // Memoize drag event handlers
  const onDragOver = useCallback((e) => { handleDragOver(e); }, [handleDragOver]);
  const onDragLeave = useCallback((e) => { handleDragLeave(e); }, [handleDragLeave]);
  const onDrop = useCallback((e) => { handleDrop(e); }, [handleDrop]);
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={dropAreaClasses}
      aria-label="PGN file drop area"
      tabIndex={0}
      role="button"
    >
      {children}
    </div>
  );
}

function FileInput({ allowedFormats, handleFileInputChange, id }) {
  // Memoize file input handler
  const onInputChange = useCallback((e) => { handleFileInputChange(e); }, [handleFileInputChange]);
  return (
    <>
      <input
        type="file"
        accept={allowedFormats.join(',')}
        onChange={onInputChange}
        className="hidden"
        id={id}
        tabIndex={-1}
      />
    </>
  );
}

/**
 * PGNFileDrop - Accessible, memoized file drop and browse area for PGN uploads.
 * @param {boolean} isDragging
 * @param {function} handleDragOver
 * @param {function} handleDragLeave
 * @param {function} handleDrop
 * @param {string[]} allowedFormats
 * @param {number} maxFileSize
 * @param {function} handleFileInputChange
 */
export const PGNFileDrop = React.memo(function PGNFileDrop({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  allowedFormats,
  maxFileSize,
  handleFileInputChange
}) {
  const fileInputId = useMemo(() => 'pgn-file-input', []);
  return (
    <section
      className="mb-6 w-full max-w-7xl mx-auto bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-6 flex flex-col items-center justify-center"
      aria-label="PGN File Upload"
      tabIndex={0}
    >
      <FileDropArea
        isDragging={isDragging}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
      >
        <ArrowUpTrayIcon className="w-14 h-14 mx-auto text-accent mb-4" aria-hidden="true" />
        <p className="text-xl font-medium text-primary mb-2">Drop your PGN file here</p>
        <p className="text-gray-dark mb-4">or click to browse</p>
        <FileInput allowedFormats={allowedFormats} handleFileInputChange={handleFileInputChange} id={fileInputId} />
        <label
          htmlFor={fileInputId}
          className="inline-block px-6 py-2 bg-accent text-white rounded-lg cursor-pointer hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors text-base font-semibold"
          tabIndex={0}
          role="button"
          aria-label="Choose PGN file"
        >
          Choose File
        </label>
        <p className="text-xs text-gray-dark mt-2">Max size: {Math.round(maxFileSize / 1024 / 1024)}MB | Formats: {allowedFormats.join(', ')}</p>
      </FileDropArea>
    </section>
  );
});

export default PGNFileDrop;
