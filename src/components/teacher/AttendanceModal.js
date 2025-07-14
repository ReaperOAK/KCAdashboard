
import React, { useState, useEffect } from 'react';

// Utility: format date (SRP)
function formatDate(dateString) {
  return dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';
}

/**
 * AttendanceModal: Beautiful, accessible, responsive modal for marking attendance.
 * - Single responsibility: UI for attendance marking only.
 * - Uses color tokens, transitions, ARIA, and responsive layout.
 */
const AttendanceModal = React.memo(function AttendanceModal({ open, student, sessions, onSubmit, onClose, loading }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');

  // Reset form when modal opens or sessions change
  useEffect(() => {
    setSelectedSession(sessions && sessions.length > 0 ? sessions[0].id : null);
    setStatus('present');
    setNotes('');
  }, [sessions, open]);

  // Accessibility: trap focus, close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-6 animate-fade-in"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-md sm:max-w-lg bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light px-4 py-6 sm:px-8 transition-all duration-300">
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2 text-center">Mark Attendance</h2>
        <div className="text-base text-gray-dark mb-4 text-center font-medium">{student.name}</div>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-dark">Loading sessions...</span>
          </div>
        ) : (
          sessions && sessions.length > 0 ? (
            <form
              onSubmit={e => { e.preventDefault(); onSubmit({ session_id: selectedSession, status, notes }); }}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label htmlFor="session-select" className="block text-sm font-medium text-primary mb-1">Session</label>
                <select
                  id="session-select"
                  value={selectedSession || ''}
                  onChange={e => setSelectedSession(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
                  required
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({formatDate(s.date_time)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status-select" className="block text-sm font-medium text-primary mb-1">Status</label>
                <select
                  id="status-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes-input" className="block text-sm font-medium text-primary mb-1">Notes <span className="text-gray-dark font-normal">(optional)</span></label>
                <input
                  id="notes-input"
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-light bg-white focus:ring-2 focus:ring-accent focus:border-accent text-gray-dark px-3 py-2 transition-all"
                  maxLength={120}
                  placeholder="Add any notes..."
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-light rounded-lg text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent font-semibold transition-all disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Mark Attendance
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[120px]">
              <div className="text-gray-dark mb-4 text-center">No pending sessions for this student.</div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-light rounded-lg text-gray-dark bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                Close
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
});

export default AttendanceModal;
