
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';

const StudentAttendanceSkeleton = React.memo(function StudentAttendanceSkeleton() {
  return (
    <div className="flex items-center justify-center h-32" role="status" aria-busy="true">
      <div className="animate-pulse text-lg text-gray-dark">Loading student attendance...</div>
    </div>
  );
});

const SearchAndBatchFilter = React.memo(function SearchAndBatchFilter({ searchTerm, onSearch, selectedBatch, onBatchChange, batches }) {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4 gap-2 md:gap-0">
      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={onSearch}
        className="px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search students"
      />
      <select
        value={selectedBatch}
        onChange={onBatchChange}
        className="px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Select batch"
      >
        <option value="all">All Batches</option>
        {batches.map(batch => (
          <option key={batch.id} value={batch.id}>{batch.name}</option>
        ))}
      </select>
    </div>
  );
});

const AttendanceTable = React.memo(function AttendanceTable({ students, onViewDetails }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-light">
        <thead className="bg-primary">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Student Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Batch</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Present</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Absent</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Late</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Attendance %</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-light cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{student.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{student.batch_name}</td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-green-600">{student.present_count}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-red-600">{student.absent_count}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-yellow-600">{student.late_count}</span></td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  student.attendance_percentage >= 75 ? 'bg-green-100 text-green-800' :
                  student.attendance_percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {student.attendance_percentage}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onViewDetails(student.id)}
                  className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
                  aria-label={`View details for ${student.full_name}`}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const StudentAttendanceList = React.memo(function StudentAttendanceList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [studentsData, batchesData] = await Promise.all([
          ApiService.get(`/attendance/get-students-attendance.php?batch=${selectedBatch}`),
          ApiService.get('/batches/get-all.php'),
        ]);
        if (isMounted) {
          setStudents(studentsData.students || []);
          setBatches(batchesData.batches || []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [selectedBatch]);

  const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleBatchChange = useCallback((e) => setSelectedBatch(e.target.value), []);
  const handleViewDetails = useCallback((id) => navigate(`/admin/student/${id}/attendance`), [navigate]);

  const filteredStudents = useMemo(() =>
    students.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">Student Attendance Records</h2>
        <SearchAndBatchFilter
          searchTerm={searchTerm}
          onSearch={handleSearch}
          selectedBatch={selectedBatch}
          onBatchChange={handleBatchChange}
          batches={batches}
        />
      </div>
      {loading ? (
        <StudentAttendanceSkeleton />
      ) : (
        <AttendanceTable students={filteredStudents} onViewDetails={handleViewDetails} />
      )}
    </div>
  );
});

export default StudentAttendanceList;
