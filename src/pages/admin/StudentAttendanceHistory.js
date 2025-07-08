
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttendanceApi } from '../../api/attendance';
import { UsersApi } from '../../api/users';

const StudentAttendanceHistorySkeleton = React.memo(function StudentAttendanceHistorySkeleton() {
  return (
    <div className="flex items-center justify-center h-32" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading attendance history...</div>
    </div>
  );
});

const AttendanceStats = React.memo(function AttendanceStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="p-4 sm:p-3 bg-green-100 rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs text-green-800">Present</div>
        <div className="text-2xl sm:text-xl font-bold text-green-900">{stats.present}</div>
      </div>
      <div className="p-4 sm:p-3 bg-red-100 rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs text-red-800">Absent</div>
        <div className="text-2xl sm:text-xl font-bold text-red-900">{stats.absent}</div>
      </div>
      <div className="p-4 sm:p-3 bg-yellow-100 rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs text-yellow-800">Late</div>
        <div className="text-2xl sm:text-xl font-bold text-yellow-900">{stats.late}</div>
      </div>
      <div className="p-4 sm:p-3 bg-accent/20 rounded-lg flex flex-col items-start">
        <div className="text-sm sm:text-xs text-accent">Attendance %</div>
        <div className="text-2xl sm:text-xl font-bold text-accent">{stats.attendancePercentage}%</div>
      </div>
    </div>
  );
});

const AttendanceTable = React.memo(function AttendanceTable({ attendanceData }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-light text-sm sm:text-xs md:text-sm">
        <thead className="bg-primary">
          <tr>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
            <th className="px-4 sm:px-2 py-3 text-left text-xs font-medium text-white uppercase">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {attendanceData.map((record) => (
            <tr key={record.id}>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark">
                {new Date(record.session_date).toLocaleDateString()}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-text-dark">
                {record.batch_name}
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="px-4 sm:px-2 py-4 whitespace-nowrap text-gray-500">
                {record.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const StudentAttendanceHistory = React.memo(function StudentAttendanceHistory() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendancePercentage: 0,
  });
  const { studentId } = useParams();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [attendance, student] = await Promise.all([
          AttendanceApi.getUserAttendance(studentId),
          UsersApi.getDetails(studentId),
        ]);
        if (isMounted) {
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
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch attendance data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [studentId]);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg w-full max-w-5xl mx-auto my-4">
      {loading ? (
        <StudentAttendanceHistorySkeleton />
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary break-words">
              Attendance History: {studentInfo?.full_name}
            </h2>
            <AttendanceStats stats={stats} />
          </div>
          <AttendanceTable attendanceData={attendanceData} />
        </>
      )}
    </div>
  );
});

export default StudentAttendanceHistory;
