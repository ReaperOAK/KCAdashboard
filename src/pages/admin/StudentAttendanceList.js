
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AttendanceApi } from '../../api/attendance';
import { BatchesApi } from '../../api/batches';
import StudentAttendanceSkeleton from '../../components/attendance/StudentAttendanceSkeleton';
import SearchAndBatchFilter from '../../components/attendance/SearchAndBatchFilter';
import StudentAttendanceTable from '../../components/attendance/StudentAttendanceTable';

const StudentAttendanceList = React.memo(function StudentAttendanceList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [studentsData, batchesData] = await Promise.all([
          AttendanceApi.getStudentsAttendance(selectedBatch),
           BatchesApi.getBatches(),
        ]);
        if (isMounted) {
          const normalizedStudents = (studentsData.students || []).map(student => ({
            ...student,
            attendance_percentage: Number(student.attendance_percentage),
          }));
          setStudents(normalizedStudents);
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

  const filteredStudents = useMemo(() =>
    students.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]
  );

  return (
    <div className="px-2 sm:px-4 md:px-6 py-4 sm:py-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Student Attendance Records</h2>
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
        <StudentAttendanceTable students={filteredStudents} />
      )}
    </div>
  );
});

export default StudentAttendanceList;
