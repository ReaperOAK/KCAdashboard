import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';

const StudentAttendanceList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsData, batchesData] = await Promise.all([
                    ApiService.get(`/attendance/get-students-attendance.php?batch=${selectedBatch}`),
                    ApiService.get('/batches/get-all.php')
                ]);
                setStudents(studentsData.students || []);
                setBatches(batchesData.batches || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedBatch]);

    const filteredStudents = students.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#200e4a]">Student Attendance Records</h2>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                    />
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                    >
                        <option value="all">All Batches</option>
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{student.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.batch_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-green-600">{student.present_count}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-red-600">{student.absent_count}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-yellow-600">{student.late_count}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-sm ${
                                            student.attendance_percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                            student.attendance_percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {student.attendance_percentage}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => navigate(`/admin/student/${student.id}/attendance`)}
                                            className="text-[#461fa3] hover:text-[#7646eb]"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentAttendanceList;
