import React, { useState, useEffect } from 'react';

const AttendanceModal = React.memo(function AttendanceModal({ open, student, sessions, onSubmit, onClose, loading }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setSelectedSession(sessions && sessions.length > 0 ? sessions[0].id : null);
    setStatus('present');
    setNotes('');
  }, [sessions, open]);

  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Mark Attendance: {student.name}</h2>
        {loading ? (
          <div>Loading sessions...</div>
        ) : (
          sessions && sessions.length > 0 ? (
            <form onSubmit={e => { e.preventDefault(); onSubmit({ session_id: selectedSession, status, notes }); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session</label>
                <select value={selectedSession || ''} onChange={e => setSelectedSession(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300">
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({formatDate(s.date_time)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-white bg-secondary hover:bg-accent">Mark Attendance</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-gray-500 mb-4">No pending sessions for this student.</div>
              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
});

function formatDate(dateString) {
  return dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

export default AttendanceModal;
