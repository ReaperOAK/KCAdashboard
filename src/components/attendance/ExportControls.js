import React, { useCallback } from 'react';

const ExportControls = React.memo(function ExportControls({ dateRange, setDateRange, exportFormat, setExportFormat, onExport, disabled }) {
  const handleStartChange = useCallback(e => setDateRange(prev => ({ ...prev, start: e.target.value })), [setDateRange]);
  const handleEndChange = useCallback(e => setDateRange(prev => ({ ...prev, end: e.target.value })), [setDateRange]);
  const handleFormatChange = useCallback(e => setExportFormat(e.target.value), [setExportFormat]);
  return (
    <div className="flex space-x-2">
      <input
        type="date"
        value={dateRange.start || ''}
        onChange={handleStartChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Start date"
      />
      <input
        type="date"
        value={dateRange.end || ''}
        onChange={handleEndChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="End date"
      />
      <select
        value={exportFormat}
        onChange={handleFormatChange}
        className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Export format"
      >
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
      </select>
      <button
        type="button"
        onClick={onExport}
        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 transition-all duration-200"
        disabled={disabled}
        aria-disabled={disabled}
      >
        Export Report
      </button>
    </div>
  );
});

export default ExportControls;
