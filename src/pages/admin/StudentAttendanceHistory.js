

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AttendanceApi } from '../../api/attendance';
import { UsersApi } from '../../api/users';
import StudentAttendanceHistorySkeleton from '../../components/attendance/StudentAttendanceHistorySkeleton';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import AttendanceTable from '../../components/attendance/AttendanceTable';


const EMPTY_STATS = {
  totalClasses: 0,
  present: 0,
  absent: 0,
  late: 0,
  attendancePercentage: 0,
};

const StudentAttendanceHistory = React.memo(function StudentAttendanceHistory() {
  const { studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [attendance, student] = await Promise.all([
        AttendanceApi.getUserAttendance(studentId),
        UsersApi.getDetails(studentId),
      ]);
      setAttendanceData(attendance.data || []);
      setStudentInfo(student);
      const total = attendance.data.length;
      const present = attendance.data.filter(a => a.status === 'present').length;
      const absent = attendance.data.filter(a => a.status === 'absent').length;
      const late = attendance.data.filter(a => a.status === 'late').length;
      setStats({
        totalClasses: total,
        present,
        absent,
        late,
        attendancePercentage: total ? ((present + late) / total * 100).toFixed(2) : 0,
      });
    } catch (err) {
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAttendance]);

  return (
    <section
      className="p-2 sm:p-4 md:p-6 bg-background-light dark:bg-background-dark rounded-2xl shadow-xl w-full max-w-5xl mx-auto my-4 border border-gray-light"
      aria-labelledby="attendance-history-title"
      tabIndex={-1}
    >
      {loading ? (
        <StudentAttendanceHistorySkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <span className="text-error text-lg font-semibold mb-2">{error}</span>
          <button
            className="mt-2 px-4 py-2 bg-accent text-white rounded hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={fetchAttendance}
            aria-label="Retry loading attendance"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="attendance-history-title"
              className="text-2xl md:text-3xl font-bold text-primary break-words"
            >
              Attendance History{studentInfo?.full_name ? `: ${studentInfo.full_name}` : ''}
            </h2>
            <span className="text-sm text-gray-dark font-medium">
              {stats.totalClasses > 0 ? `${stats.totalClasses} classes` : 'No classes found'}
            </span>
          </header>
          <AttendanceStats stats={stats} />
          <div className="mt-8">
            {attendanceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[120px] text-center">
                <span className="text-gray-dark text-base">No attendance records found.</span>
              </div>
            ) : (
              <AttendanceTable attendanceData={attendanceData} />
            )}
          </div>
        </>
      )}
    </section>
  );
});

export default StudentAttendanceHistory;
