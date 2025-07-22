

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
import { FaUserGraduate, FaSearch, FaUpload, FaClipboardList, FaStar, FaHistory, FaChartLine, FaCheckCircle } from 'react-icons/fa';

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
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (selectedBatch === 'all') {
        res = await GradingApi.getAllStudents();
      } else {
        res = await BatchesApi.getBatchStudents(selectedBatch);
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
  }, [selectedBatch]);

  useEffect(() => {
    if (user && user.id) fetchStudents();
  }, [fetchStudents, user]);

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
  const [actionSuccess, setActionSuccess] = useState(null);

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
    setActionSuccess(null);
  }, []);
  const handleCloseFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
    setSelectedStudent(null);
    setActionError(null);
    setActionSuccess(null);
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
    setActionSuccess(null);
    try {
      const response = await GradingApi.uploadReportCard(student.id, file);
      if (response.success) {
        // Reset the file input for this student
        const fileInput = document.getElementById(`report-card-upload-${student.id}`);
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Show success message
        setActionSuccess(`Report card uploaded successfully for ${student.name}`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setActionSuccess(null), 5000);
        
        // Refresh the students list from the server to get the latest data
        await fetchStudents();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Report card upload error:', err);
      setActionError(err.message || 'Failed to upload report card');
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
    <main className="max-w-7xl mx-auto py-8 animate-fade-in">
      <header className="flex items-center gap-2 mb-4">
        <FaUserGraduate className="text-accent w-7 h-7 mr-1" aria-hidden="true" />
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Student Management</h1>
      </header>
      <section className="bg-background-light border border-gray-light rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex gap-2 items-center">
            <label htmlFor="batch-select" className="font-medium text-text-dark">Batch:</label>
            <select id="batch-select" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="border border-gray-light rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="all">All Batches</option>
              {batches.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="border border-gray-light rounded px-2 py-1 w-full pl-8 focus:outline-none focus:ring-2 focus:ring-accent transition-all" />
            <FaSearch className="absolute left-2 top-2.5 text-gray-dark w-4 h-4" aria-hidden="true" />
          </div>
        </div>
        {loading && <div className="py-8 text-center text-gray-dark">Loading...</div>}
        {error && <div className="text-red-700 bg-red-100 border border-red-400 rounded px-4 py-2 mb-2">{error}</div>}
        {actionError && <div className="text-red-700 bg-red-100 border border-red-400 rounded px-4 py-2 mb-2">{actionError}</div>}
        {actionSuccess && <div className="text-green-700 bg-green-100 border border-green-400 rounded px-4 py-2 mb-2">{actionSuccess}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm sm:text-base divide-y divide-gray-light">
              <thead className="bg-primary text-white text-sm uppercase">
                <tr>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('name')}>Student {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('batch_name')}>Batch {sortKey === 'batch_name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('last_rating')}>Last Rating {sortKey === 'last_rating' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2 cursor-pointer" onClick={() => handleSort('last_feedback_date')}>Last Feedback {sortKey === 'last_feedback_date' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                  <th className="px-3 py-2">Report Card</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-light">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-dark">No students found</td>
                  </tr>
                ) : filteredStudents.map(stu => (
                  <tr key={stu.id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-text-dark">{stu.name}</div>
                      <div className="text-xs text-gray-dark">{stu.email}</div>
                    </td>
                    <td className="px-3 py-2 text-text-dark">{stu.batch_name}</td>
                    <td className="px-3 py-2">{stu.last_rating ? <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRatingColor(stu.last_rating)}`}>{stu.last_rating}/5 <FaStar className="ml-1 text-yellow-500 w-3 h-3" aria-hidden="true" /></span> : <span className="text-gray-400">Not rated</span>}</td>
                    <td className="px-3 py-2 text-text-dark">{stu.last_feedback_date ? formatDate(stu.last_feedback_date) : 'No feedback yet'}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        {stu.report_card_url ? (
                          <a
                            href={stu.report_card_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center gap-1 group"
                            title="View uploaded report card"
                            aria-label={`View report card for ${stu.name}`}
                          >
                            <FaClipboardList className="w-4 h-4 group-hover:text-secondary transition-colors" aria-hidden="true" />
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                        <form
                          className="flex gap-1 items-center mt-1"
                          onSubmit={e => {
                            e.preventDefault();
                            handleReportCardUpload(stu, e.target.report_card.files[0]);
                          }}
                          aria-label={`Upload report card for ${stu.name}`}
                        >
                          <input
                            type="file"
                            name="report_card"
                            accept="application/pdf,image/*"
                            className="hidden"
                            id={`report-card-upload-${stu.id}`}
                          />
                          <label
                            htmlFor={`report-card-upload-${stu.id}`}
                            className="cursor-pointer text-secondary hover:text-accent text-xs border border-secondary px-2 py-1 rounded bg-gray-50 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                            tabIndex={0}
                            title="Upload PDF or image"
                          >
                            <FaUpload className="w-3 h-3" aria-hidden="true" />
                            <span>Upload</span>
                          </label>
                          <button
                            type="submit"
                            className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 ml-1 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={uploading}
                            title={uploading ? 'Uploading...' : 'Submit report card'}
                          >
                            <FaCheckCircle className="w-3 h-3" aria-hidden="true" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleMarkAttendance(stu)} className="text-secondary hover:text-accent focus:outline-none border border-secondary px-2 py-1 rounded flex items-center gap-1 transition-all" aria-label={`Mark attendance for ${stu.name}`}><FaClipboardList className="w-4 h-4" aria-hidden="true" />Attendance</button>
                        <button type="button" onClick={() => handleOpenFeedbackModal(stu)} className="text-secondary hover:text-accent focus:outline-none border border-secondary px-2 py-1 rounded flex items-center gap-1 transition-all" aria-label={`Add feedback for ${stu.name}`}><FaStar className="w-4 h-4" aria-hidden="true" />Feedback</button>
                        <button type="button" onClick={() => handleViewHistory(stu)} className="text-secondary hover:text-accent focus:outline-none border border-secondary px-2 py-1 rounded flex items-center gap-1 transition-all" aria-label={`View feedback history for ${stu.name}`}><FaHistory className="w-4 h-4" aria-hidden="true" />History</button>
                        <button type="button" onClick={() => handleViewPerformance(stu)} className="text-secondary hover:text-accent focus:outline-none border border-secondary px-2 py-1 rounded flex items-center gap-1 transition-all" aria-label={`View performance for ${stu.name}`}><FaChartLine className="w-4 h-4" aria-hidden="true" />Performance</button>
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
      </section>
    </main>
  );
};

export default StudentManagement;
