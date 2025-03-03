import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';
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
    
    // Export related states
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState('attendance');
    const [exportFilters, setExportFilters] = useState({
        batch_id: '',
        start_date: '',
        end_date: '',
        status: ''
    });
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

    // Function to export data
    const handleExport = async () => {
        try {
            setExportLoading(true);
            
            // Prepare filters based on the export type
            const filters = { ...exportFilters };
            
            // If batch is selected in the main UI, use it as default for export
            if (selectedBatch !== 'all' && !filters.batch_id) {
                filters.batch_id = selectedBatch;
            }
            
            // For batch comparison, create an array of batch IDs
            if (exportType === 'batch_comparison' && filters.batch_ids) {
                filters.batch_ids = filters.batch_ids.split(',').map(id => id.trim());
            }
            
            console.log(`Exporting ${exportType} report with filters:`, filters);
            
            // Check if date filters are valid
            if (filters.start_date && filters.end_date) {
                const start = new Date(filters.start_date);
                const end = new Date(filters.end_date);
                
                if (start > end) {
                    throw new Error('Start date cannot be after end date');
                }
                
                // Check if dates are in the future
                const now = new Date();
                if (start > now) {
                    console.warn('Warning: Start date is in the future');
                }
            }
            
            try {
                // Call the API to get the report
                const blob = await ApiService.exportReport(exportType, filters);
                
                // Verify that we got a valid blob
                if (!blob || blob.size === 0) {
                    throw new Error('Received empty file from server');
                }
                
                // Create a download link and trigger download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                
                // Set filename based on export type
                let filename = `${exportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
                a.download = filename;
                
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setExportLoading(false);
                setShowExportModal(false);
                
                // Reset filters
                setExportFilters({
                    batch_id: '',
                    start_date: '',
                    end_date: '',
                    status: ''
                });
            } catch (apiError) {
                console.error('API Error during export:', apiError);
                throw apiError;
            }
            
        } catch (error) {
            console.error('Export error:', error);
            setExportLoading(false);
            
            // Show a more user-friendly error message
            const errorMessage = error.message.includes('Server error:') || error.message.includes('Failed')
                ? error.message
                : `Export failed: ${error.message || 'Unknown error. Please contact support if this issue persists.'}`;
                
            alert(errorMessage);
        }
    };
    
    const renderExportFilters = () => {
        switch (exportType) {
            case 'attendance':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={exportFilters.batch_id}
                                onChange={(e) => setExportFilters({...exportFilters, batch_id: e.target.value})}
                            >
                                <option value="">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.start_date}
                                    onChange={(e) => setExportFilters({...exportFilters, start_date: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.end_date}
                                    onChange={(e) => setExportFilters({...exportFilters, end_date: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={exportFilters.status}
                                onChange={(e) => setExportFilters({...exportFilters, status: e.target.value})}
                            >
                                <option value="">All Statuses</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                            </select>
                        </div>
                    </>
                );
                
            case 'student_performance':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={exportFilters.batch_id}
                                onChange={(e) => setExportFilters({...exportFilters, batch_id: e.target.value})}
                            >
                                <option value="">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.start_date}
                                    onChange={(e) => setExportFilters({...exportFilters, start_date: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.end_date}
                                    onChange={(e) => setExportFilters({...exportFilters, end_date: e.target.value})}
                                />
                            </div>
                        </div>
                    </>
                );
                
            case 'quiz_results':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={exportFilters.batch_id}
                                onChange={(e) => setExportFilters({...exportFilters, batch_id: e.target.value})}
                            >
                                <option value="">All Batches</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.start_date}
                                    onChange={(e) => setExportFilters({...exportFilters, start_date: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportFilters.end_date}
                                    onChange={(e) => setExportFilters({...exportFilters, end_date: e.target.value})}
                                />
                            </div>
                        </div>
                    </>
                );
                
            case 'batch_comparison':
                return (
                    <>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch IDs (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="e.g., 1,2,3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={exportFilters.batch_ids}
                                onChange={(e) => setExportFilters({...exportFilters, batch_ids: e.target.value})}
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter the IDs of batches you want to compare, separated by commas</p>
                        </div>
                    </>
                );
                
            default:
                return null;
        }
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
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                        >
                            Export Report
                        </button>
                        <button 
                            onClick={handleRefresh}
                            className="px-4 py-2 rounded-lg bg-[#461fa3] text-white hover:bg-[#7646eb]"
                        >
                            Refresh
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
            </div>
            
            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-[#200e4a]">Export Report</h3>
                                <button 
                                    onClick={() => setShowExportModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={exportType}
                                    onChange={(e) => {
                                        setExportType(e.target.value);
                                        // Reset filters when report type changes
                                        setExportFilters({
                                            batch_id: '',
                                            start_date: '',
                                            end_date: '',
                                            status: ''
                                        });
                                    }}
                                >
                                    <option value="attendance">Attendance Report</option>
                                    <option value="student_performance">Student Performance Report</option>
                                    <option value="quiz_results">Quiz Results Report</option>
                                    <option value="batch_comparison">Batch Comparison Report</option>
                                </select>
                            </div>
                            
                            {/* Render filters based on selected export type */}
                            {renderExportFilters()}
                            
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={exportLoading}
                                    className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] flex items-center justify-center"
                                >
                                    {exportLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    )}
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsAnalytics;
