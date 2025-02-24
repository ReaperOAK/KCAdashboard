import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../utils/api';

const StudentAttendanceHistory = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        attendancePercentage: 0
    });
    const { studentId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [attendance, student] = await Promise.all([
                    ApiService.get(`/attendance/get-user-attendance.php?user_id=${studentId}`),
                    ApiService.get(`/users/get-details.php?id=${studentId}`)
                ]);

                setAttendanceData(attendance.data || []);
                setStudentInfo(student);

                // Calculate statistics
                const total = attendance.data.length;
                const present = attendance.data.filter(a => a.status === 'present').length;
                const absent = attendance.data.filter(a => a.status === 'absent').length;
                const late = attendance.data.filter(a => a.status === 'late').length;

                setStats({
                    totalClasses: total,
                    present,
                    absent,
                    late,
                    attendancePercentage: total ? ((present + late) / total * 100).toFixed(2) : 0
                });

            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[#200e4a]">
                            Attendance History: {studentInfo?.full_name}
                        </h2>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            <div className="p-4 bg-green-100 rounded-lg">
                                <div className="text-sm text-green-800">Present</div>
                                <div className="text-2xl font-bold text-green-900">{stats.present}</div>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg">
                                <div className="text-sm text-red-800">Absent</div>
                                <div className="text-2xl font-bold text-red-900">{stats.absent}</div>
                            </div>
                            <div className="p-4 bg-yellow-100 rounded-lg">
                                <div className="text-sm text-yellow-800">Late</div>
                                <div className="text-2xl font-bold text-yellow-900">{stats.late}</div>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-lg">
                                <div className="text-sm text-blue-800">Attendance %</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.attendancePercentage}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendanceData.map((record) => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(record.session_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {record.batch_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendanceHistory;
