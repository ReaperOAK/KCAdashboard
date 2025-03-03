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
        </div>
    );
};

export default ReportsAnalytics;
