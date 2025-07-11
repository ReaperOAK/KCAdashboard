
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttendanceApi } from '../../api/attendance';
import { UsersApi } from '../../api/users';
import StudentAttendanceHistorySkeleton from '../../components/attendance/StudentAttendanceHistorySkeleton';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import AttendanceTable from '../../components/attendance/AttendanceTable';

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
