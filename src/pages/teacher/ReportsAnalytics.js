

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnalyticsApi } from '../../api/analytics';
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
import LoadingSkeleton from '../../components/analytics/LoadingSkeleton';
import ErrorAlert from '../../components/analytics/ErrorAlert';
import ChartCard from '../../components/analytics/ChartCard';
import QuickStats from '../../components/analytics/QuickStats';
import ExportModal from '../../components/analytics/ExportModal';

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


export const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    try {
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
    <main className="min-h-screen bg-background-light animate-fade-in">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <svg className="w-7 h-7 text-accent mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3V3zm3 6h12M9 3v6m6-6v6" /></svg>
            Reports & Analytics
          </h1>
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
              className="px-3 py-2 rounded-lg bg-secondary text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full md:w-auto flex items-center gap-2 transition-all"
              aria-label="Refresh analytics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582M20 20v-5h-.581M5 19A9 9 0 1 1 19 5" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-400 gap-2 transition-all"
              aria-label="Export analytics data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
          </div>
        </section>
        {/* Analytics Content */}
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
    </main>
  );
};

export default ReportsAnalytics;
