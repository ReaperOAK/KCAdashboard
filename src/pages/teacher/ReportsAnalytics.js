import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';
import ExportButton from '../../components/ExportButton'; // Import the export button
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

const ReportsAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        attendanceData: {
            labels: [],
            datasets: []
        },
        performanceData: {
            labels: [],
            datasets: []
        },
        quizStats: {
            labels: [],
            datasets: []
        }
    });
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [batches, setBatches] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFilters, setExportFilters] = useState({
        batch_id: '',
        start_date: '',
        end_date: '',
        status: ''
    });
    const [exportType, setExportType] = useState('attendance');
    const [exportLoading, setExportLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching analytics data for batch:', selectedBatch);
            const response = await ApiService.get(`/analytics/teacher-stats.php?batch=${selectedBatch}`);
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch analytics data');
            }
            
            console.log('Analytics data received:', response);
            setStats(response.stats);
            setBatches(response.batches || []);
            setLoading(false);
        } catch (error) {
            console.error('Analytics fetch error:', error);
            setError(error.message || 'Failed to fetch analytics data');
            setLoading(false);
        }
    }, [selectedBatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Reports & Analytics</h1>
                    <div className="flex gap-4">
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        >
                            <option value="all">All Batches</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleRefresh}
                            className="px-4 py-2 rounded-lg bg-[#461fa3] text-white hover:bg-[#7646eb]"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#461fa3]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 p-4 rounded-xl text-red-700 mb-6">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Attendance Overview */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Attendance Overview</h2>
                            {stats.attendanceData && (
                                <Line 
                                    data={stats.attendanceData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' }
                                        }
                                    }}
                                />
                            )}
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Student Performance</h2>
                            {stats.performanceData && (
                                <Bar 
                                    data={stats.performanceData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' }
                                        }
                                    }}
                                />
                            )}
                        </div>

                        {/* Quiz Statistics */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Quiz Statistics</h2>
                            {stats.quizStats && (
                                <Doughnut 
                                    data={stats.quizStats}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' }
                                        }
                                    }}
                                />
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Quick Stats</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Average Attendance</p>
                                    <p className="text-2xl font-bold text-[#200e4a]">85%</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Active Students</p>
                                    <p className="text-2xl font-bold text-[#200e4a]">48</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Avg Quiz Score</p>
                                    <p className="text-2xl font-bold text-[#200e4a]">72%</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Classes This Month</p>
                                    <p className="text-2xl font-bold text-[#200e4a]">24</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Export Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Export Report</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                <select
                                    value={exportType}
                                    onChange={(e) => setExportType(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="attendance">Attendance Report</option>
                                    <option value="student_performance">Student Performance</option>
                                    <option value="quiz_results">Quiz Results</option>
                                    <option value="batch_comparison">Batch Comparison</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                                <select
                                    value={exportFilters.batch_id}
                                    onChange={(e) => setExportFilters({...exportFilters, batch_id: e.target.value})}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={exportFilters.start_date}
                                        onChange={(e) => setExportFilters({...exportFilters, start_date: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={exportFilters.end_date}
                                        onChange={(e) => setExportFilters({...exportFilters, end_date: e.target.value})}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>
                            
                            {exportType === 'attendance' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={exportFilters.status}
                                        onChange={(e) => setExportFilters({...exportFilters, status: e.target.value})}
                                        className="w-full p-2 border rounded"
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
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                
                                <ExportButton 
                                    reportType={exportType}
                                    defaultFilters={exportFilters}
                                    buttonText={exportLoading ? 'Exporting...' : 'Export Report'}
                                    className="px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsAnalytics;
