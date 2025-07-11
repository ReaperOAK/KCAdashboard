import React from 'react';
import ExportButton from '../../components/ExportButton';
import { X } from 'lucide-react';

const ExportModal = React.memo(function ExportModal({ open, onClose, exportType, setExportType, exportFilters, setExportFilters, batches }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-dark bg-opacity-75 flex items-center justify-center z-50 transition-all duration-200">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl border border-gray-light">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1"
          aria-label="Close export modal"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-primary">Export Report</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary mb-1">Report Type</label>
          <select
            value={exportType}
            onChange={e => setExportType(e.target.value)}
            className="w-full p-2 border border-gray-light rounded"
            aria-label="Report type"
          >
            <option value="attendance">Attendance Report</option>
            <option value="student_performance">Student Performance</option>
            <option value="quiz_results">Quiz Results</option>
            <option value="batch_comparison">Batch Comparison</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary mb-1">Batch</label>
          <select
            value={exportFilters.batch_id}
            onChange={e => setExportFilters({ ...exportFilters, batch_id: e.target.value })}
            className="w-full p-2 border border-gray-light rounded"
            aria-label="Batch"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Start Date</label>
            <input
              type="date"
              value={exportFilters.start_date}
              onChange={e => setExportFilters({ ...exportFilters, start_date: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="Start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">End Date</label>
            <input
              type="date"
              value={exportFilters.end_date}
              onChange={e => setExportFilters({ ...exportFilters, end_date: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="End date"
            />
          </div>
        </div>
        {exportType === 'attendance' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-1">Status</label>
            <select
              value={exportFilters.status}
              onChange={e => setExportFilters({ ...exportFilters, status: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="Attendance status"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-light rounded hover:bg-gray-dark text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          >
            Cancel
          </button>
          <ExportButton
            reportType={exportType}
            defaultFilters={exportFilters}
            buttonText="Export Report"
            className="px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
});

export default ExportModal;
