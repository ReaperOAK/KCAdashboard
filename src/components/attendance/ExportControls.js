
import React, { useCallback } from 'react';

// Export icon (Lucide/Heroicons SVG)
const ExportIcon = (
  <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
);

const ExportControls = React.memo(function ExportControls({ dateRange, setDateRange, exportFormat, setExportFormat, onExport, disabled }) {
  const handleStartChange = useCallback(e => setDateRange(prev => ({ ...prev, start: e.target.value })), [setDateRange]);
  const handleEndChange = useCallback(e => setDateRange(prev => ({ ...prev, end: e.target.value })), [setDateRange]);
  const handleFormatChange = useCallback(e => setExportFormat(e.target.value), [setExportFormat]);
  return (
    <div className="w-full max-w-2xl mx-auto bg-background-light border border-gray-light rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 mb-4 ">
      <input
        type="date"
        value={dateRange.start || ''}
        onChange={handleStartChange}
        className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
        aria-label="Start date"
      />
      <input
        type="date"
        value={dateRange.end || ''}
        onChange={handleEndChange}
        className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
        aria-label="End date"
      />
      <select
        value={exportFormat}
        onChange={handleFormatChange}
        className="flex-1 min-w-0 px-4 py-2 rounded-lg border border-gray-light bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
        aria-label="Export format"
      >
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
      </select>
      <button
        type="button"
        onClick={onExport}
        className="flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-all duration-200 text-sm font-semibold shadow-sm"
        disabled={disabled}
        aria-disabled={disabled}
      >
        {ExportIcon}
        Export Report
      </button>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none; } }
        . { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
});

export default ExportControls;
