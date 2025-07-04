import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../utils/api';

// --- Attendance Modal ---
const AttendanceModal = React.memo(function AttendanceModal({ open, student, sessions, onSubmit, onClose, loading }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setSelectedSession(sessions && sessions.length > 0 ? sessions[0].id : null);
    setStatus('present');
    setNotes('');
  }, [sessions, open]);

  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Mark Attendance: {student.name}</h2>
        {loading ? (
          <div>Loading sessions...</div>
        ) : (
          sessions && sessions.length > 0 ? (
            <form onSubmit={e => { e.preventDefault(); onSubmit({ session_id: selectedSession, status, notes }); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session</label>
                <select value={selectedSession || ''} onChange={e => setSelectedSession(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300">
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} ({formatDate(s.date_time)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-white bg-secondary hover:bg-accent">Mark Attendance</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-gray-500 mb-4">No pending sessions for this student.</div>
              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
});


// --- Utility helpers ---
const formatDate = dateString => dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
const getRatingColor = rating => rating >= 4 ? 'bg-green-100 text-green-800' : rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

// --- Feedback Modal ---
const FeedbackModal = React.memo(function FeedbackModal({ open, student, feedback, setFeedback, onClose, onSubmit }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Feedback for {student.name}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center space-x-1 mt-1">
              {[1,2,3,4,5].map(num => (
                <span key={num} style={{ cursor: 'pointer', color: feedback.rating >= num ? '#f5b301' : '#ccc', fontSize: 28 }} onClick={() => setFeedback(f => ({ ...f, rating: num }))}>★</span>
              ))}
              <span className="ml-2 text-sm text-gray-500">{feedback.rating}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">General Feedback</label>
            <textarea value={feedback.comment} onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Areas of Improvement</label>
            <textarea value={feedback.areas_of_improvement} onChange={e => setFeedback(f => ({ ...f, areas_of_improvement: e.target.value }))} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Strengths</label>
            <textarea value={feedback.strengths} onChange={e => setFeedback(f => ({ ...f, strengths: e.target.value }))} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent">Submit Feedback</button>
          </div>
        </form>
      </div>
    </div>
  );
});

// --- Feedback History Modal ---
const FeedbackHistoryModal = React.memo(function FeedbackHistoryModal({ open, student, feedbackHistory, onClose }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Feedback History for {student.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {feedbackHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No feedback history available</p>
        ) : (
          <div className="space-y-6">
            {feedbackHistory.map((feedback) => (
              <div key={feedback.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">{formatDate(feedback.created_at)}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                </div>
                {feedback.comment && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">General Feedback:</h4><p className="text-sm text-gray-600">{feedback.comment}</p></div>)}
                {feedback.strengths && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">Strengths:</h4><p className="text-sm text-gray-600">{feedback.strengths}</p></div>)}
                {feedback.areas_of_improvement && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">Areas for Improvement:</h4><p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p></div>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// --- Performance Modal (GradingFeedback style) ---
const PerformanceModal = React.memo(function PerformanceModal({ open, student, performanceData, selectedTimeframe, onTimeframeChange, onClose }) {
  if (!open || !student) return null;
  // Chart.js is not imported here, so just show summary and recent feedback/quiz for now
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Performance: {student.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Time frame selector */}
        <div className="flex space-x-2 mb-6">
          <span className="text-gray-700">Time Period:</span>
          {['week', 'month', 'quarter', 'year'].map(period => (
            <button
              key={period}
              type="button"
              onClick={() => onTimeframeChange(period)}
              className={`px-3 py-1 text-sm rounded-md ${selectedTimeframe === period ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-pressed={selectedTimeframe === period}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        {!performanceData ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Attendance Summary</h3>
              {performanceData.attendance ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-secondary">{performanceData.attendance.present || 0}</div>
                    <div className="text-sm text-gray-500">Present</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-red-500">{performanceData.attendance.absent || 0}</div>
                    <div className="text-sm text-gray-500">Absent</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-yellow-500">{performanceData.attendance.late || 0}</div>
                    <div className="text-sm text-gray-500">Late</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-blue-500">{performanceData.attendance.rate || 0}%</div>
                    <div className="text-sm text-gray-500">Attendance Rate</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No attendance data available</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Quiz Performance Summary</h3>
              {performanceData.quiz_performance ? (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-md">
                    <div className="text-2xl font-bold text-secondary">{performanceData.quiz_performance.average || 0}</div>
                    <div className="text-sm text-gray-500">Average Score</div>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <div className="text-2xl font-bold text-blue-500">{performanceData.quiz_performance.count || 0}</div>
                    <div className="text-sm text-gray-500">Total Quizzes</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No quiz performance data available</p>
              )}
            </div>
            {/* Recent Feedback */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Recent Teacher Feedback</h3>
              {performanceData.feedback && performanceData.feedback.length > 0 ? (
                <div className="space-y-4">
                  {performanceData.feedback.map((feedback) => (
                    <div key={feedback.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">By {feedback.teacher_name} on {formatDate(feedback.created_at)}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                      </div>
                      {feedback.comment && (<div className="mb-2"><h5 className="text-sm font-medium text-gray-700">Comment:</h5><p className="text-sm text-gray-600">{feedback.comment}</p></div>)}
                      {feedback.strengths && (<div className="mb-2"><h5 className="text-sm font-medium text-gray-700">Strengths:</h5><p className="text-sm text-gray-600">{feedback.strengths}</p></div>)}
                      {feedback.areas_of_improvement && (<div><h5 className="text-sm font-medium text-gray-700">Areas for Improvement:</h5><p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p></div>)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent feedback available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

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
        const res = await ApiService.get('/classroom/get-teacher-classes.php');
        setBatches(res.classes || []);
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
          res = await ApiService.get('/grading/get-all-students.php');
        } else {
          res = await ApiService.get(`/grading/get-batch-students.php?batch_id=${selectedBatch}`);
        }
        setStudents(res.students || []);
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
      await ApiService.submitFeedback({ student_id: selectedStudent.id, ...feedback });
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
      const response = await ApiService.getFeedbackHistory(student.id);
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
      const response = await ApiService.getStudentPerformance(student.id, timeframe);
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
        const response = await ApiService.getStudentPerformance(selectedStudent.id, period);
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
      const formData = new FormData();
      formData.append('student_id', student.id);
      formData.append('report_card', file);
      await ApiService.postFormData('/grading/upload-report-card.php', formData);
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
      const res = await ApiService.getPendingAttendanceSessions(teacherId);
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
    try {
      await ApiService.markAttendance([
        {
          student_id: selectedStudent.id,
          batch_id: students.find(s => s.id === selectedStudent.id)?.batch_id || null,
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
        <FeedbackHistoryModal open={showHistoryModal} student={selectedStudent} feedbackHistory={feedbackHistory} onClose={handleCloseHistoryModal} />
        <PerformanceModal open={showPerformanceModal} student={selectedStudent} performanceData={performanceData} selectedTimeframe={selectedTimeframe} onTimeframeChange={handleTimeframeChange} onClose={handleClosePerformanceModal} />
      </div>
    </div>
  );
};

export default StudentManagement;
