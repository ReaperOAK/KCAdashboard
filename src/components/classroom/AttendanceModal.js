import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const AttendanceModal = ({ session, onClose, onAttendanceSubmitted }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get(`/classroom/get-session-students.php?session_id=${session.id}`);
        
        if (response.success) {
          setStudents(response.students);
          
          // Initialize attendance records from existing data
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
        setError('Error retrieving students: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [session]);
  
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };
  
  const handleNotesChange = (studentId, notes) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };
  
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert records object to array
      const attendanceArray = Object.values(attendanceRecords);
      
      const response = await ApiService.post('/classroom/track-attendance.php', {
        session_id: session.id,
        attendance: attendanceArray
      });
      
      if (response.success) {
        if (onAttendanceSubmitted) {
          onAttendanceSubmitted();
        }
        onClose();
      } else {
        setError(response.message || 'Failed to submit attendance');
      }
    } catch (err) {
      setError('Error submitting attendance: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-3/4 flex flex-col">
        <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
          Take Attendance: {session.title}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {new Date(session.start).toLocaleString()} - {session.type === 'online' ? 'Online' : 'In Person'}
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="flex-grow overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner-border text-[#461fa3]" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {student.profile_picture ? (
                          <img 
                            src={student.profile_picture} 
                            alt={student.full_name}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#461fa3] text-white flex items-center justify-center mr-2">
                            {student.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div>{student.full_name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={attendanceRecords[student.id]?.status || 'present'}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
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
                        value={attendanceRecords[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        placeholder="Optional notes"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
            disabled={submitting || loading}
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
