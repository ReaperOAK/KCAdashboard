
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';

// --- Loading Skeleton ---
const AttendanceLoadingSkeleton = React.memo(() => (
  <div className="flex items-center justify-center h-full py-8" aria-busy="true" aria-label="Loading attendance">
    <div className="h-6 w-1/3 bg-gray-light rounded animate-pulse" />
  </div>
));

// --- Error Alert ---
const AttendanceErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded-lg px-4 py-3 mb-4" role="alert">
    <span className="font-semibold">Error:</span> {message}
  </div>
));

const StudentRow = React.memo(function StudentRow({ student, record, onStatusChange, onNotesChange }) {
  return (
    <tr className="hover:bg-gray-light">
      <td className="px-4 py-3">
        <div className="flex items-center">
          {student.profile_picture ? (
            <img
              src={student.profile_picture}
              alt={student.full_name}
              className="h-8 w-8 rounded-full mr-2"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center mr-2">
              {student.full_name.charAt(0)}
            </div>
          )}
          <div>
            <div>{student.full_name}</div>
            <div className="text-xs text-gray-dark">{student.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={record?.status || 'present'}
          onChange={e => onStatusChange(student.id, e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
          aria-label={`Attendance status for ${student.full_name}`}
        >
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="excused">Excused</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={record?.notes || ''}
          onChange={e => onNotesChange(student.id, e.target.value)}
          placeholder="Optional notes"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
          aria-label={`Attendance notes for ${student.full_name}`}
        />
      </td>
    </tr>
  );
});

function AttendanceModal({ session, onClose, onAttendanceSubmitted }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Fetch students and initialize attendance records
  useEffect(() => {
    let isMounted = true;
    async function fetchStudents() {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiService.get(`/classroom/get-session-students.php?session_id=${session.id}`);
        if (!isMounted) return;
        if (response.success) {
          setStudents(response.students);
          const initialRecords = {};
          response.students.forEach(student => {
            initialRecords[student.id] = {
              student_id: student.id,
              status: student.attendance_status || 'present',
              notes: student.attendance_notes || ''
            };
          });
          setAttendanceRecords(initialRecords);
        } else {
          setError(response.message || 'Failed to fetch students');
        }
      } catch (err) {
        if (isMounted) setError('Error retrieving students: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchStudents();
    return () => { isMounted = false; };
  }, [session]);

  // Memoized handlers
  const handleStatusChange = useCallback((studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  }, []);
  const handleNotesChange = useCallback((studentId, notes) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      setError(null);
      const attendanceArray = Object.values(attendanceRecords);
      const response = await ApiService.post('/classroom/track-attendance.php', {
        session_id: session.id,
        attendance: attendanceArray
      });
      if (response.success) {
        if (onAttendanceSubmitted) onAttendanceSubmitted();
        onClose();
      } else {
        setError(response.message || 'Failed to submit attendance');
      }
    } catch (err) {
      setError('Error submitting attendance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }, [attendanceRecords, onAttendanceSubmitted, onClose, session.id]);

  // Memoize table rows
  const studentRows = useMemo(() => students.map(student => (
    <StudentRow
      key={student.id}
      student={student}
      record={attendanceRecords[student.id]}
      onStatusChange={handleStatusChange}
      onNotesChange={handleNotesChange}
    />
  )), [students, attendanceRecords, handleStatusChange, handleNotesChange]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" role="dialog" aria-modal="true" aria-label="Attendance Modal">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-3/4 flex flex-col">
        <h2 className="text-2xl font-bold text-primary mb-4">Take Attendance: {session.title}</h2>
        <p className="text-gray-dark mb-4">
          {new Date(session.start).toLocaleString()} - {session.type === 'online' ? 'Online' : 'In Person'}
        </p>
        {error && <AttendanceErrorAlert message={error} />}
        <div className="flex-grow overflow-auto">
          {loading ? (
            <AttendanceLoadingSkeleton />
          ) : (
            <table className="w-full" aria-label="Attendance table">
              <thead className="bg-gray-light sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-light">
                {studentRows}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-dark hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
            disabled={submitting}
            aria-label="Cancel attendance modal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={submitting || loading}
            aria-label="Submit attendance"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AttendanceModal);
