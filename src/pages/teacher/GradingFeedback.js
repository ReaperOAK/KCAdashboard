
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import ApiService from '../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// --- Utility hooks and helpers ---
const useBatches = () => {
  const [batches, setBatches] = useState([]);
  useEffect(() => {
    ApiService.get('/classroom/get-teacher-classes.php')
      .then(res => setBatches(res.classes))
      .catch(() => setBatches([]));
  }, []);
  return batches;
};

const useStudents = (selectedBatch, setError, setLoading) => {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    setLoading(true);
    const endpoint = selectedBatch === 'all'
      ? '/grading/get-all-students.php'
      : `/grading/get-batch-students.php?batch_id=${selectedBatch}`;
    ApiService.get(endpoint)
      .then(res => setStudents(res.students))
      .catch(() => setError('Failed to fetch students'))
      .finally(() => setLoading(false));
  }, [selectedBatch, setError, setLoading]);
  return students;
};

const formatDate = dateString => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const getRatingColor = rating => rating >= 4 ? 'bg-green-100 text-green-800' : rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

// --- Loading and Error UI ---
const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center py-12" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
  </div>
));

const ErrorAlert = React.memo(({ error }) => (
  <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6" role="alert">{error}</div>
));

// --- Feedback Modal ---
const FeedbackModal = React.memo(function FeedbackModal({ open, student, feedback, setFeedback, onClose, onSubmit }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" role="dialog" aria-modal="true" aria-labelledby="feedbackModalTitle">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 id="feedbackModalTitle" className="text-2xl font-bold text-primary mb-4">Feedback for {student.name}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <select
              value={feedback.rating}
              onChange={e => setFeedback(f => ({ ...f, rating: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Rating"
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">General Feedback</label>
            <textarea
              value={feedback.comment}
              onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="General Feedback"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Areas of Improvement</label>
            <textarea
              value={feedback.areas_of_improvement}
              onChange={e => setFeedback(f => ({ ...f, areas_of_improvement: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Areas of Improvement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Strengths</label>
            <textarea
              value={feedback.strengths}
              onChange={e => setFeedback(f => ({ ...f, strengths: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Strengths"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent"
            >
              Submit Feedback
            </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" role="dialog" aria-modal="true" aria-labelledby="historyModalTitle">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="historyModalTitle" className="text-2xl font-bold text-primary">Feedback History for {student.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close feedback history"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
                {feedback.comment && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700">General Feedback:</h4>
                    <p className="text-sm text-gray-600">{feedback.comment}</p>
                  </div>
                )}
                {feedback.strengths && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Strengths:</h4>
                    <p className="text-sm text-gray-600">{feedback.strengths}</p>
                  </div>
                )}
                {feedback.areas_of_improvement && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Areas for Improvement:</h4>
                    <p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// --- Performance Modal ---
const PerformanceModal = React.memo(function PerformanceModal({ open, student, performanceData, selectedTimeframe, onTimeframeChange, onClose }) {
  // Chart options memoized
  const chartOptions = useMemo(() => ({
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Performance Chart' } },
  }), []);
  const attendanceChartOptions = useMemo(() => ({
    scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 10, callback: value => value + '%' } } },
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Attendance' } },
  }), []);

  // Chart data helpers
  const quizChartData = useMemo(() => performanceData?.charts?.quiz_scores || null, [performanceData]);
  const attendanceChartData = useMemo(() => performanceData?.charts?.monthly_attendance || null, [performanceData]);

  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40" role="dialog" aria-modal="true" aria-labelledby="performanceModalTitle">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 id="performanceModalTitle" className="text-2xl font-bold text-primary">Performance Analytics: {student.name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close performance analytics"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          <LoadingSpinner />
        ) : (
          <div>
            {/* Debug info - remove in production */}
            <div className="mb-4 p-2 bg-yellow-100 rounded text-xs">
              <details>
                <summary>Debug: Performance Data Structure</summary>
                <pre className="mt-2 overflow-auto max-h-32">{JSON.stringify(performanceData, null, 2)}</pre>
              </details>
            </div>
            <div className="space-y-8">
              {/* Quiz Performance Chart */}
              <div className="bg-gray-50 p-4 rounded-lg w-full overflow-x-auto">
                <h3 className="text-lg font-medium text-primary mb-4">Quiz Performance</h3>
                {quizChartData && quizChartData.labels && quizChartData.labels.length > 0 ? (
                  <div className="h-64"><Bar data={quizChartData} options={chartOptions} /></div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No quiz data available for this time period</p>
                )}
              </div>
              {/* Monthly Attendance Chart */}
              <div className="bg-gray-50 p-4 rounded-lg w-full overflow-x-auto">
                <h3 className="text-lg font-medium text-primary mb-4">Monthly Attendance Trend</h3>
                {attendanceChartData && attendanceChartData.labels && attendanceChartData.labels.length > 0 ? (
                  <div className="h-64"><Line data={attendanceChartData} options={attendanceChartOptions} /></div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No attendance data available for this time period</p>
                )}
              </div>
              {/* Attendance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
                {/* Quiz Performance Summary */}
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
              </div>
              {/* Recent Quiz Results */}
              <div className="bg-gray-50 p-4 rounded-lg w-full overflow-x-auto">
                <h3 className="text-lg font-medium text-primary mb-4">Recent Quiz Results</h3>
                {performanceData.quiz_performance && performanceData.quiz_performance.detailed && performanceData.quiz_performance.detailed.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quiz</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Score</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Difficulty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceData.quiz_performance.detailed.slice(0, 10).map((quiz, index) => (
                          <tr key={index} className="bg-white">
                            <td className="px-3 py-2 text-sm text-gray-900">{quiz.title}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{quiz.score}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">
                              <span className={`px-2 py-1 text-xs rounded-full ${quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{quiz.difficulty}</span>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-500">{formatDate(quiz.completed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No quiz data available</p>
                )}
              </div>
              {/* Recent Feedback */}
              <div className="bg-gray-50 p-4 rounded-lg w-full overflow-x-auto">
                <h3 className="text-lg font-medium text-primary mb-4">Recent Teacher Feedback</h3>
                {performanceData.feedback && performanceData.feedback.length > 0 ? (
                  <div className="space-y-4">
                    {performanceData.feedback.map((feedback) => (
                      <div key={feedback.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">By {feedback.teacher_name} on {formatDate(feedback.created_at)}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                        </div>
                        {feedback.comment && (
                          <div className="mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Comment:</h5>
                            <p className="text-sm text-gray-600">{feedback.comment}</p>
                          </div>
                        )}
                        {feedback.strengths && (
                          <div className="mb-2">
                            <h5 className="text-sm font-medium text-gray-700">Strengths:</h5>
                            <p className="text-sm text-gray-600">{feedback.strengths}</p>
                          </div>
                        )}
                        {feedback.areas_of_improvement && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700">Areas for Improvement:</h5>
                            <p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent feedback available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// --- Main Component ---
export const GradingFeedback = () => {
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });

  const batches = useBatches();
  const students = useStudents(selectedBatch, setError, setLoading);

  // Handlers
  const handleOpenFeedbackModal = useCallback(student => {
    setSelectedStudent(student);
    setShowFeedbackModal(true);
  }, []);
  const handleCloseFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
  }, []);
  const handleSubmitFeedback = useCallback(async e => {
    e.preventDefault();
    try {
      await ApiService.submitFeedback({ student_id: selectedStudent.id, ...feedback });
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '', areas_of_improvement: '', strengths: '' });
      setSelectedStudent(null);
      setError(null);
    } catch {
      setError('Failed to submit feedback');
    }
  }, [selectedStudent, feedback]);
  const handleViewHistory = useCallback(async student => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const response = await ApiService.getFeedbackHistory(student.id);
      setFeedbackHistory(response.feedback);
      setShowHistoryModal(true);
    } catch {
      setError('Failed to fetch feedback history');
    } finally {
      setLoading(false);
    }
  }, []);
  const handleViewPerformance = useCallback(async student => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const response = await ApiService.getStudentPerformance(student.id, selectedTimeframe);
      setPerformanceData(response);
      setShowPerformanceModal(true);
    } catch {
      setError('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);
  const handleTimeframeChange = useCallback(async timeframe => {
    setSelectedTimeframe(timeframe);
    if (selectedStudent) {
      setLoading(true);
      try {
        const response = await ApiService.getStudentPerformance(selectedStudent.id, timeframe);
        setPerformanceData(response);
      } catch {
        setError('Failed to update performance data');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedStudent]);
  const handleCloseHistoryModal = useCallback(() => setShowHistoryModal(false), []);
  const handleClosePerformanceModal = useCallback(() => setShowPerformanceModal(false), []);

  // --- Render ---
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Student Grading & Feedback</h1>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary text-sm w-full sm:w-auto"
            aria-label="Select batch"
          >
            <option value="all">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
        </div>
        {error && <ErrorAlert error={error} />}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Grade</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Feedback</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-gray-500">No students found</td>
                  </tr>
                ) : students.map(student => (
                  <tr key={student.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{student.batch_name}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      {student.last_rating ? (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRatingColor(student.last_rating)}`}>{student.last_rating}/5</span>
                      ) : <span className="text-gray-400">Not rated</span>}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{student.last_feedback_date ? formatDate(student.last_feedback_date) : 'No feedback yet'}</td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenFeedbackModal(student)}
                          className="text-secondary hover:text-accent focus:outline-none"
                          aria-label={`Add feedback for ${student.name}`}
                        >
                          Add Feedback
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewHistory(student)}
                          className="text-secondary hover:text-accent focus:outline-none"
                          aria-label={`View feedback history for ${student.name}`}
                        >
                          History
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewPerformance(student)}
                          className="text-secondary hover:text-accent focus:outline-none"
                          aria-label={`View performance for ${student.name}`}
                        >
                          Performance
                        </button>
                        {/* Report Card Upload */}
                        <form
                          onSubmit={async e => {
                            e.preventDefault();
                            const formData = new FormData();
                            formData.append('student_id', student.id);
                            if (e.target.report_card.files[0]) {
                              formData.append('report_card', e.target.report_card.files[0]);
                            } else {
                              alert('Please select a file to upload.');
                              return;
                            }
                            try {
                              await ApiService.postFormData('/grading/upload-report-card.php', formData);
                              alert('Report card uploaded successfully!');
                            } catch (err) {
                              alert('Failed to upload report card: ' + (err.message || err));
                            }
                          }}
                          className="inline-flex items-center gap-1"
                        >
                          <input
                            type="file"
                            name="report_card"
                            accept="application/pdf,image/*"
                            className="hidden"
                            id={`report-card-upload-${student.id}`}
                          />
                          <label htmlFor={`report-card-upload-${student.id}`} className="cursor-pointer text-secondary hover:text-accent text-xs border px-2 py-1 rounded bg-gray-50" tabIndex={0} aria-label={`Upload report card for ${student.name}`}>Upload Report Card</label>
                          <button type="submit" className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 ml-1">Upload</button>
                        </form>
                        {/* Download link if report card exists */}
                        {student.report_card_url && (
                          <a
                            href={student.report_card_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline ml-2"
                            aria-label={`View report card for ${student.name}`}
                          >
                            View Report Card
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <FeedbackModal
          open={showFeedbackModal}
          student={selectedStudent}
          feedback={feedback}
          setFeedback={setFeedback}
          onClose={handleCloseFeedbackModal}
          onSubmit={handleSubmitFeedback}
        />
        <FeedbackHistoryModal
          open={showHistoryModal}
          student={selectedStudent}
          feedbackHistory={feedbackHistory}
          onClose={handleCloseHistoryModal}
        />
        <PerformanceModal
          open={showPerformanceModal}
          student={selectedStudent}
          performanceData={performanceData}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
          onClose={handleClosePerformanceModal}
        />
      </div>
    </div>
  );
};

