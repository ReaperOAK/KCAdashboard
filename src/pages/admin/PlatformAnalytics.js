import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import ApiService from '../../utils/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
  Legend
} from 'chart.js';

// Register ChartJS components
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

const PlatformAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        userStats: null,
        activityStats: null,
        performanceStats: null,
        revenueStats: null
    });
    const [timeRange, setTimeRange] = useState('month'); // week, month, year

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await ApiService.get(`/analytics/get-stats.php?range=${timeRange}`);
            setAnalytics(response);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch analytics data');
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Platform Analytics</h1>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading analytics...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Growth Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">User Growth</h2>
                            <Line
                                data={{
                                    labels: analytics.userStats?.labels || [],
                                    datasets: [{
                                        label: 'New Users',
                                        data: analytics.userStats?.data || [],
                                        borderColor: '#461fa3',
                                        tension: 0.4
                                    }]
                                }}
                            />
                        </div>

                        {/* User Activity Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">User Activity</h2>
                            <Bar
                                data={{
                                    labels: analytics.activityStats?.labels || [],
                                    datasets: [{
                                        label: 'Active Users',
                                        data: analytics.activityStats?.data || [],
                                        backgroundColor: '#7646eb'
                                    }]
                                }}
                            />
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Performance Metrics</h2>
                            <Pie
                                data={{
                                    labels: ['Quizzes', 'Games', 'Tournaments', 'Classes'],
                                    datasets: [{
                                        data: [
                                            analytics.performanceStats?.quizzes || 0,
                                            analytics.performanceStats?.games || 0,
                                            analytics.performanceStats?.tournaments || 0,
                                            analytics.performanceStats?.classes || 0
                                        ],
                                        backgroundColor: [
                                            '#461fa3',
                                            '#7646eb',
                                            '#9b6feb',
                                            '#c198eb'
                                        ]
                                    }]
                                }}
                            />
                        </div>

                        {/* Revenue Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold text-[#461fa3] mb-4">Revenue Overview</h2>
                            <Line
                                data={{
                                    labels: analytics.revenueStats?.labels || [],
                                    datasets: [{
                                        label: 'Revenue (₹)',
                                        data: analytics.revenueStats?.data || [],
                                        borderColor: '#32CD32',
                                        tension: 0.4
                                    }]
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlatformAnalytics;
