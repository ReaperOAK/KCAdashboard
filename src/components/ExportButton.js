
import React, { useState, useCallback } from 'react';
import ApiService from '../utils/api';

// Error message popover
const ErrorPopover = React.memo(function ErrorPopover({ message }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 w-full max-w-xs mx-auto bg-red-100 border border-red-400 text-red-700 px-2 py-2 sm:px-3 rounded text-sm z-10 break-words" role="alert">
      {message}
    </div>
  );
});

// Spinner for loading state
const Spinner = React.memo(function Spinner() {
  return (
    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" aria-label="Loading" />
  );
});

export const ExportButton = React.memo(function ExportButton({ reportType = 'attendance', defaultFilters = {}, buttonText = 'Export', className = '' }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      // Call the API to get the report
      const blob = await ApiService.exportReport(reportType, defaultFilters);
      if (!blob || blob.size === 0) throw new Error('Received empty file from server');
      // Download logic
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      let message = error.message || 'Unknown error occurred during export';
      if (error.response?.data?.message) message = error.response.data.message;
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [reportType, defaultFilters]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-400 ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        aria-busy={loading}
        aria-label={buttonText}
      >
        {loading ? <Spinner /> : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {buttonText}
      </button>
      {errorMessage && <ErrorPopover message={errorMessage} />}
    </div>
  );
});

export default ExportButton;
