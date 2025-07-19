import React, { useCallback, useMemo } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

function StatusIcon({ status }) {
  return status === 'success' ? (
    <CheckCircleIcon className="w-6 h-6 mr-2 text-success flex-shrink-0" aria-hidden="true" />
  ) : (
    <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-error flex-shrink-0" aria-hidden="true" />
  );
}

/**
 * PGNStatusMessage - Accessible, memoized status alert for PGN upload feedback.
 * @param {string} uploadStatus - 'success' | 'error'
 * @param {string} statusMessage
 * @param {function} onClose
 */
  // Memoize color classes for status
const PGNStatusMessage = React.memo(function PGNStatusMessage({ uploadStatus, statusMessage, onClose }) {
  const statusClasses = useMemo(() =>
    uploadStatus === 'success'
      ? 'bg-success/10 border border-success text-success'
      : 'bg-error/10 border border-error text-error',
    [uploadStatus]
  );

  
  // Memoize close handler
  const handleClose = useCallback((e) => {
    e.preventDefault();
    onClose();
  }, [onClose]);

  if (!uploadStatus) return null;
  return (
    <section
      className={`mb-6 w-full max-w-xl mx-auto p-4 rounded-xl flex items-center gap-3 shadow-md ${statusClasses}`}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      <StatusIcon status={uploadStatus} />
      <span className="flex-1 text-base font-medium">{statusMessage}</span>
      <button
        type="button"
        onClick={handleClose}
        className="ml-auto p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:bg-gray-light/40 transition-colors"
        aria-label="Close status message"
      >
        <XMarkIcon className="w-6 h-6" aria-hidden="true" />
      </button>
    </section>
  );
});
export default PGNStatusMessage;
