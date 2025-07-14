
import React from 'react';
import ExportButton from '../../components/ExportButton';
import { X } from 'lucide-react';

// Enhanced ExportModal: beautiful, responsive, accessible, and focused
const ExportModal = React.memo(function ExportModal({ open, onClose, exportType, setExportType, exportFilters, setExportFilters, batches }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-dark/70 backdrop-blur-sm transition-all duration-300">
      <dialog
        open
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border-l-8 border-accent p-0 overflow-hidden animate-[modalIn_0.25s] focus:outline-none"
        aria-modal="true"
        aria-label="Export Report Modal"
        tabIndex={-1}
        style={{ border: 'none' }}
      >
        <form method="dialog" className="flex flex-col max-h-[90vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1 z-10"
            aria-label="Close export modal"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
          <header className="px-6 pt-6 pb-2 border-b border-gray-light dark:border-gray-dark bg-background-light dark:bg-background-dark">
            <h2 className="text-2xl font-semibold text-primary dark:text-text-light tracking-tight">Export Report</h2>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary dark:text-text-light mb-1">Report Type</label>
              <select
                value={exportType}
                onChange={e => setExportType(e.target.value)}
                className="w-full p-2 border border-gray-light dark:border-gray-dark rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-primary dark:text-text-light"
                aria-label="Report type"
              >
                <option value="attendance">Attendance Report</option>
                <option value="student_performance">Student Performance</option>
                <option value="quiz_results">Quiz Results</option>
                <option value="batch_comparison">Batch Comparison</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary dark:text-text-light mb-1">Batch</label>
              <select
                value={exportFilters.batch_id}
                onChange={e => setExportFilters({ ...exportFilters, batch_id: e.target.value })}
                className="w-full p-2 border border-gray-light dark:border-gray-dark rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-primary dark:text-text-light"
                aria-label="Batch"
              >
                <option value="">All Batches</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-primary dark:text-text-light mb-1">Start Date</label>
                <input
                  type="date"
                  value={exportFilters.start_date}
                  onChange={e => setExportFilters({ ...exportFilters, start_date: e.target.value })}
                  className="w-full p-2 border border-gray-light dark:border-gray-dark rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-primary dark:text-text-light"
                  aria-label="Start date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary dark:text-text-light mb-1">End Date</label>
                <input
                  type="date"
                  value={exportFilters.end_date}
                  onChange={e => setExportFilters({ ...exportFilters, end_date: e.target.value })}
                  className="w-full p-2 border border-gray-light dark:border-gray-dark rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-primary dark:text-text-light"
                  aria-label="End date"
                />
              </div>
            </div>
            {exportType === 'attendance' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-primary dark:text-text-light mb-1">Status</label>
                <select
                  value={exportFilters.status}
                  onChange={e => setExportFilters({ ...exportFilters, status: e.target.value })}
                  className="w-full p-2 border border-gray-light dark:border-gray-dark rounded focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-background-dark text-primary dark:text-text-light"
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
                className="px-4 py-2 bg-gray-light dark:bg-gray-dark rounded hover:bg-gray-dark dark:hover:bg-gray-light text-primary dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
                type="button"
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
        </form>
        <style>{`
          @keyframes modalIn {
            0% { opacity: 0; transform: translateY(40px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </dialog>
    </div>
  );
});

export default ExportModal;
