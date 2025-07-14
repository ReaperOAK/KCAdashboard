

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttendanceApi } from '../../api/attendance';
import { BatchesApi } from '../../api/batches';
import StudentAttendanceListView from '../../components/attendance/StudentAttendanceListView';

/**
 * Container component: Handles data fetching, state, and business logic only.
 * UI rendering is delegated to StudentAttendanceListView (presentational component).
 */
const StudentAttendanceList = React.memo(function StudentAttendanceList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
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
      } catch (err) {
        if (isMounted) setError('Failed to fetch attendance data. Please try again.');
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
    <StudentAttendanceListView
      students={filteredStudents}
      loading={loading}
      error={error}
      searchTerm={searchTerm}
      onSearch={handleSearch}
      selectedBatch={selectedBatch}
      onBatchChange={handleBatchChange}
      batches={batches}
    />
  );
});

export default StudentAttendanceList;
