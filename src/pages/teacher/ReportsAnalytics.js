
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnalyticsApi } from '../../api/analytics';
import ExportButton from '../../components/ExportButton';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" aria-label="Loading" />
  </div>
);

// Error alert
const ErrorAlert = ({ error, onRetry }) => (
  <div className="bg-red-100 p-4 rounded-xl text-red-700 mb-6" role="alert">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-bold">Error Loading Analytics</p>
        <p>{error}</p>
        <p className="text-sm mt-1">Please check your internet connection and try again.</p>
      </div>
      <button
        onClick={onRetry}
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        Retry
      </button>
    </div>
  </div>
);

// Chart card wrapper
const ChartCard = React.memo(function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-light">
      <h2 className="text-lg sm:text-xl font-semibold text-secondary mb-3 sm:mb-4">{title}</h2>
      {children}
    </div>
  );
});

// Quick stats grid
const QuickStats = React.memo(function QuickStats({ summaryStats }) {
  return (
    <ChartCard title="Quick Stats">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Average Attendance</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.avgAttendance || 0}%</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Active Students</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.activeStudents || 0}</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Avg Quiz Score</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.avgQuizScore || 0}%</p>
        </div>
        <div className="text-center p-3 sm:p-4 bg-gray-light/40 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-dark">Classes This Month</p>
          <p className="text-xl sm:text-2xl font-bold text-primary">{summaryStats?.classesThisMonth || 0}</p>
        </div>
      </div>
    </ChartCard>
  );
});

// Export modal
const ExportModal = React.memo(function ExportModal({ open, onClose, exportType, setExportType, exportFilters, setExportFilters, batches }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-dark bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Export Report</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary mb-1">Report Type</label>
          <select
            value={exportType}
            onChange={e => setExportType(e.target.value)}
            className="w-full p-2 border border-gray-light rounded"
            aria-label="Report type"
          >
            <option value="attendance">Attendance Report</option>
            <option value="student_performance">Student Performance</option>
            <option value="quiz_results">Quiz Results</option>
            <option value="batch_comparison">Batch Comparison</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary mb-1">Batch</label>
          <select
            value={exportFilters.batch_id}
            onChange={e => setExportFilters({ ...exportFilters, batch_id: e.target.value })}
            className="w-full p-2 border border-gray-light rounded"
            aria-label="Batch"
          >
            <option value="">All Batches</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Start Date</label>
            <input
              type="date"
              value={exportFilters.start_date}
              onChange={e => setExportFilters({ ...exportFilters, start_date: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="Start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">End Date</label>
            <input
              type="date"
              value={exportFilters.end_date}
              onChange={e => setExportFilters({ ...exportFilters, end_date: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="End date"
            />
          </div>
        </div>
        {exportType === 'attendance' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary mb-1">Status</label>
            <select
              value={exportFilters.status}
              onChange={e => setExportFilters({ ...exportFilters, status: e.target.value })}
              className="w-full p-2 border border-gray-light rounded"
              aria-label="Attendance status"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-light rounded hover:bg-gray-dark text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Cancel
          </button>
          <ExportButton
            reportType={exportType}
            defaultFilters={exportFilters}
            buttonText="Export Report"
            className="px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
});

export const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [stats, setStats] = useState({
    attendanceData: { labels: [], datasets: [] },
    performanceData: { labels: [], datasets: [] },
    quizStats: { labels: [], datasets: [] },
    summaryStats: { avgAttendance: 0, activeStudents: 0, avgQuizScore: 0, classesThisMonth: 0 },
  });
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState({ batch_id: '', start_date: '', end_date: '', status: '' });
  const [exportType, setExportType] = useState('attendance');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    try {
      // Debug: Check if we have auth token
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setDebugInfo(`User: ${user.name || 'Unknown'}, Role: ${user.role || 'Unknown'}, Token: ${token ? 'Present' : 'Missing'}`);
      // Use AnalyticsApi for teacher stats
      const batchId = selectedBatch !== 'all' ? selectedBatch : 'all';
      const response = await AnalyticsApi.getTeacherStats(batchId);
      if (response && response.success) {
        setStats(response.stats);
        setBatches(response.batches || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch analytics data');
      }
      setLoading(false);
    } catch (error) {
      setError(`Failed to fetch analytics data: ${error.message}`);
      setStats({
        attendanceData: { labels: [], datasets: [] },
        performanceData: { labels: [], datasets: [] },
        quizStats: { labels: [], datasets: [] },
        summaryStats: { avgAttendance: 0, activeStudents: 0, avgQuizScore: 0, classesThisMonth: 0 },
      });
      setBatches([]);
      setLoading(false);
    }
  }, [selectedBatch]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const handleRefresh = useCallback(() => { fetchData(); }, [fetchData]);

  // Chart options (memoized)
  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  }), []);
  const doughnutOptions = useMemo(() => ({ responsive: true, plugins: { legend: { position: 'bottom' } } }), []);

  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Reports & Analytics</h1>
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary w-full md:w-auto"
              aria-label="Select batch"
            >
              <option value="all">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded-lg bg-secondary text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full md:w-auto"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
          </div>
        </div>
        {/* Debug Info - Show only in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="bg-blue-100 p-2 rounded mb-4 text-sm text-blue-800">
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorAlert error={error} onRetry={handleRefresh} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            <ChartCard title="Attendance Overview">
              {stats.attendanceData && stats.attendanceData.labels && stats.attendanceData.labels.length > 0 ? (
                <Line data={stats.attendanceData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-dark">
                  <p>No attendance data available</p>
                </div>
              )}
            </ChartCard>
            <ChartCard title="Student Performance">
              {stats.performanceData && stats.performanceData.labels && stats.performanceData.labels.length > 0 ? (
                <Bar data={stats.performanceData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-dark">
                  <p>No performance data available</p>
                </div>
              )}
            </ChartCard>
            <ChartCard title="Quiz Score Distribution">
              {stats.quizStats && stats.quizStats.labels && stats.quizStats.labels.length > 0 ? (
                <Doughnut data={stats.quizStats} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-dark">
                  <p>No quiz data available</p>
                </div>
              )}
            </ChartCard>
            <QuickStats summaryStats={stats.summaryStats} />
          </div>
        )}
        <ExportModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          exportType={exportType}
          setExportType={setExportType}
          exportFilters={exportFilters}
          setExportFilters={setExportFilters}
          batches={batches}
        />
      </div>
    </div>
  );
};

export default ReportsAnalytics;
