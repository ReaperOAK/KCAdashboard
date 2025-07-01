import React, { useCallback, useMemo } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

function StatusIcon({ status }) {
  return status === 'success' ? (
    <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" aria-hidden="true" />
  ) : (
    <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" aria-hidden="true" />
  );
}

/**
 * PGNStatusMessage - Accessible, memoized status alert for PGN upload feedback.
 * @param {string} uploadStatus - 'success' | 'error'
 * @param {string} statusMessage
 * @param {function} onClose
 */
export const PGNStatusMessage = React.memo(function PGNStatusMessage({ uploadStatus, statusMessage, onClose }) {
  // Memoize color classes for status
  const statusClasses = useMemo(() =>
    uploadStatus === 'success'
      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700',
    [uploadStatus]
  );

  // Memoize close handler
  const handleClose = useCallback((e) => {
    e.preventDefault();
    onClose();
  }, [onClose]);

  if (!uploadStatus) return null;
  return (
    <div
      className={`mb-6 p-4 rounded-lg flex items-center gap-2 shadow-md ${statusClasses}`}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      <StatusIcon status={uploadStatus} />
      <span className="flex-1 text-sm font-medium">{statusMessage}</span>
      <button
        type="button"
        onClick={handleClose}
        className="ml-auto p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 hover:bg-gray-light/40 dark:hover:bg-gray-dark/40 transition-colors"
        aria-label="Close status message"
      >
        <XMarkIcon className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
});

export default PGNStatusMessage;
