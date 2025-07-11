

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AttendanceApi } from '../../api/attendance';
import { GradingApi } from '../../api/grading';
import { AnalyticsApi } from '../../api/analytics';
import { BatchesApi } from '../../api/batches';
import AttendanceModal from '../../components/teacher/AttendanceModal';
import FeedbackModal from '../../components/teacher/FeedbackModal';
import FeedbackHistoryModal from '../../components/teacher/FeedbackHistoryModal';
import PerformanceModal from '../../components/teacher/PerformanceModal';

// --- Utility helpers ---
const formatDate = dateString => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const getRatingColor = rating => rating >= 4 ? 'bg-green-100 text-green-800' : rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

const StudentManagement = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch batches for dropdown
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        // Use BatchesApi for batch info
        const res = await BatchesApi.getBatches();
        setBatches(res.batches || []);
      } catch {
        setBatches([]);
      }
    };
    fetchBatches();
  }, []);

  // Fetch students for selected batch
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (selectedBatch === 'all') {
          // You may want to move this to a StudentsApi if available
          res = await GradingApi.getAllStudents ? await GradingApi.getAllStudents() : { students: [] };
        } else {
          res = await GradingApi.getBatchStudents ? await GradingApi.getBatchStudents(selectedBatch) : { students: [] };
        }
        // Support both {students: [...]} and {data: [...]} and fallback to []
        setStudents(
          Array.isArray(res.students) ? res.students :
          Array.isArray(res.data) ? res.data :
          []
        );
      } catch (err) {
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.id) fetchStudents();
  }, [selectedBatch, user]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(stu =>
        stu.name.toLowerCase().includes(s) ||
        (stu.email && stu.email.toLowerCase().includes(s)) ||
        (stu.batch_name && stu.batch_name.toLowerCase().includes(s))
      );
    }
    filtered = [...filtered].sort((a, b) => {
      let vA = a[sortKey] || '';
      let vB = b[sortKey] || '';
      if (typeof vA === 'string') vA = vA.toLowerCase();
      if (typeof vB === 'string') vB = vB.toLowerCase();
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [students, search, sortKey, sortDir]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceSessions, setAttendanceSessions] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // --- Action handlers ---
  const handleOpenFeedbackModal = useCallback(student => {
    setSelectedStudent(student);
    setShowFeedbackModal(true);
    setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
    setActionError(null);
  }, []);
  const handleCloseFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
    setSelectedStudent(null);
    setActionError(null);
  }, []);
  const handleSubmitFeedback = useCallback(async e => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActionError(null);
    try {
      await GradingApi.submitFeedback({ student_id: selectedStudent.id, ...feedback });
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
      setSelectedStudent(null);
    } catch (err) {
      setActionError('Failed to submit feedback');
    }
  }, [selectedStudent, feedback]);

  const handleViewHistory = useCallback(async student => {
    setSelectedStudent(student);
    setLoading(true);
    setActionError(null);
    try {
      const response = await GradingApi.getFeedbackHistory(student.id);
      setFeedbackHistory(response.feedback || []);
      setShowHistoryModal(true);
    } catch {
      setActionError('Failed to fetch feedback history');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleViewPerformance = useCallback(async (student, timeframe = selectedTimeframe) => {
    setSelectedStudent(student);
    setLoading(true);
    setActionError(null);
    try {
      const response = await AnalyticsApi.getStudentPerformance(student.id, timeframe);
      setPerformanceData(response);
      setShowPerformanceModal(true);
    } catch {
      setActionError('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  const handleTimeframeChange = useCallback(async (period) => {
    setSelectedTimeframe(period);
    if (selectedStudent) {
      setLoading(true);
      try {
        const response = await AnalyticsApi.getStudentPerformance(selectedStudent.id, period);
        setPerformanceData(response);
      } catch {
        setActionError('Failed to update performance data');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedStudent]);

  const handleCloseHistoryModal = useCallback(() => setShowHistoryModal(false), []);
  const handleClosePerformanceModal = useCallback(() => setShowPerformanceModal(false), []);

  // --- Report card upload ---
  const handleReportCardUpload = async (student, file) => {
    if (!file) return;
    setUploading(true);
    setActionError(null);
    try {
      await GradingApi.uploadReportCard(student.id, file);
      // Optionally, refresh students list to show new report card
      setStudents(students => students.map(s => s.id === student.id ? { ...s, report_card_url: '/uploads/report_cards/' + file.name } : s));
    } catch (err) {
      setActionError('Failed to upload report card');
    } finally {
      setUploading(false);
    }
  };

  // --- Attendance action ---
  const handleMarkAttendance = async student => {
    setActionError(null);
    setAttendanceLoading(true);
    setSelectedStudent(student);
    setShowAttendanceModal(true);
    try {
      // Fetch all pending sessions for this student's batch (filter by batch and student)
      // We'll fetch all pending sessions for the teacher, then filter for this student's batch
      const teacherId = user?.id;
      const res = await AttendanceApi.getPendingAttendanceSessions(teacherId);
      // Only sessions for this student's batch
      const sessions = (res.sessions || []).filter(s => s.batch_name === student.batch_name);
      setAttendanceSessions(sessions);
    } catch (err) {
      setAttendanceSessions([]);
      setActionError('Failed to load sessions for attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSubmitAttendance = async ({ session_id, status, notes }) => {
    setActionError(null);
    setAttendanceLoading(true);
    if (selectedBatch === 'all' || !selectedBatch) {
      setActionError('Please select a specific batch before marking attendance.');
      setAttendanceLoading(false);
      return;
    }
    try {
      await AttendanceApi.markAttendance([
        {
          student_id: selectedStudent.id,
          batch_id: selectedBatch,
          session_id,
          status,
          notes
        }
      ]);
      setShowAttendanceModal(false);
    } catch (err) {
      setActionError('Failed to mark attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex gap-2 items-center">
            <label htmlFor="batch-select" className="font-medium">Batch:</label>
            <select id="batch-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">All Batches</option>
              {batches.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
          </div>
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1 w-full sm:w-64" />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {actionError && <div className="text-red-600">{actionError}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('name')}>Student {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('batch_name')}>Batch {sortKey === 'batch_name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('last_rating')}>Last Rating {sortKey === 'last_rating' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('last_feedback_date')}>Last Feedback {sortKey === 'last_feedback_date' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2">Report Card</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">No students found</td>
                  </tr>
                ) : filteredStudents.map(stu => (
                  <tr key={stu.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium">{stu.name}</div>
                      <div className="text-xs text-gray-500">{stu.email}</div>
                    </td>
                    <td className="px-3 py-2">{stu.batch_name}</td>
                    <td className="px-3 py-2">{stu.last_rating ? <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRatingColor(stu.last_rating)}`}>{stu.last_rating}/5</span> : <span className="text-gray-400">Not rated</span>}</td>
                    <td className="px-3 py-2">{stu.last_feedback_date ? formatDate(stu.last_feedback_date) : 'No feedback yet'}</td>
                    <td className="px-3 py-2">
                      {stu.report_card_url ? (
                        <a href={stu.report_card_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                      ) : <span className="text-gray-400">None</span>}
                      <form className="inline-block ml-2" onSubmit={e => { e.preventDefault(); handleReportCardUpload(stu, e.target.report_card.files[0]); }}>
                        <input type="file" name="report_card" accept="application/pdf,image/*" className="hidden" id={`report-card-upload-${stu.id}`} />
                        <label htmlFor={`report-card-upload-${stu.id}`} className="cursor-pointer text-secondary hover:text-accent text-xs border px-2 py-1 rounded bg-gray-50" tabIndex={0}>Upload</label>
                        <button type="submit" className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 ml-1" disabled={uploading}>Upload</button>
                      </form>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleMarkAttendance(stu)} className="text-secondary hover:text-accent focus:outline-none border px-2 py-1 rounded" aria-label={`Mark attendance for ${stu.name}`}>Attendance</button>
                        <button type="button" onClick={() => handleOpenFeedbackModal(stu)} className="text-secondary hover:text-accent focus:outline-none border px-2 py-1 rounded" aria-label={`Add feedback for ${stu.name}`}>Feedback</button>
                        <button type="button" onClick={() => handleViewHistory(stu)} className="text-secondary hover:text-accent focus:outline-none border px-2 py-1 rounded" aria-label={`View feedback history for ${stu.name}`}>History</button>
                        <button type="button" onClick={() => handleViewPerformance(stu)} className="text-secondary hover:text-accent focus:outline-none border px-2 py-1 rounded" aria-label={`View performance for ${stu.name}`}>Performance</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AttendanceModal open={showAttendanceModal} student={selectedStudent} sessions={attendanceSessions} onSubmit={handleSubmitAttendance} onClose={() => setShowAttendanceModal(false)} loading={attendanceLoading} />
        <FeedbackModal open={showFeedbackModal} student={selectedStudent} feedback={feedback} setFeedback={setFeedback} onClose={handleCloseFeedbackModal} onSubmit={handleSubmitFeedback} />
        <FeedbackHistoryModal open={showHistoryModal} student={selectedStudent} feedbackHistory={feedbackHistory} onClose={handleCloseHistoryModal} formatDate={formatDate} getRatingColor={getRatingColor} />
        <PerformanceModal open={showPerformanceModal} student={selectedStudent} performanceData={performanceData} selectedTimeframe={selectedTimeframe} onTimeframeChange={handleTimeframeChange} onClose={handleClosePerformanceModal} formatDate={formatDate} getRatingColor={getRatingColor} />
      </div>
    </div>
  );
};

export default StudentManagement;
