import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';
import Calendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

const AttendanceSystem = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [settings, setSettings] = useState({
        minAttendancePercent: 75,
        lateThreshold: 15,
        autoMarkAbsent: 30,
        reminderBefore: 60
    });
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const fetchAttendanceData = useCallback(async () => {
        try {
            const response = await ApiService.get(`/attendance/get-all.php?batch=${selectedBatch}`);
            if (response.attendance_data) {
                setAttendanceData(response.attendance_data);
            }
            if (response.settings) {
                setSettings(response.settings);
            }
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
        }
    }, [selectedBatch]);

    const fetchBatches = useCallback(async () => {
        try {
            const response = await ApiService.get('/batches/get-all.php');
            setBatches(response.batches);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchBatches(), fetchAttendanceData()]).finally(() => {
            setLoading(false);
        });
    }, [fetchBatches, fetchAttendanceData]);

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        try {
            await ApiService.post('/attendance/update-settings.php', settings);
            setShowSettingsModal(false);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    const handleExportReport = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            // First verify if token is still valid
            try {
                await ApiService.request('/auth/verify-token.php', 'GET');
            } catch (error) {
                localStorage.removeItem('token');
                throw new Error('Your session has expired. Please login again.');
            }

            // Proceed with export using fetch API
            const queryString = new URLSearchParams({
                format: exportFormat,
                batch_id: selectedBatch,
                start_date: dateRange.start,
                end_date: dateRange.end
            }).toString();

            const response = await fetch(
                `${ApiService.API_URL}/attendance/export.php?${queryString}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': exportFormat === 'pdf' ? 'application/pdf' : 'text/csv',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Export failed');
                }
                throw new Error(`Export failed with status: ${response.status}`);
            }

            // Handle successful response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Failed to export report:', error);
            // Add error notification here
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg text-gray-600">Loading attendance data...</div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-[#200e4a]">Attendance System</h1>
                            <div className="flex space-x-4">
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
                                
                                {/* Add Export Controls */}
                                <div className="flex space-x-2">
                                    <input
                                        type="date"
                                        value={dateRange.start || ''}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                                    />
                                    <input
                                        type="date"
                                        value={dateRange.end || ''}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                                    />
                                    <select
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                    <button
                                        onClick={handleExportReport}
                                        className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                                        disabled={!dateRange.start || !dateRange.end}
                                    >
                                        Export Report
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowSettingsModal(true)}
                                    className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                                >
                                    Settings
                                </button>
                            </div>
                        </div>

                        {/* Calendar View */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <Calendar
                                plugins={[dayGridPlugin, timeGridPlugin]}
                                initialView="timeGridWeek"
                                events={(attendanceData || []).map(item => ({
                                    title: `${item.batch_name} - ${item.present_count}/${item.total_students}`,
                                    start: item.session_date,
                                    backgroundColor: item.attendance_percentage >= settings.minAttendancePercent 
                                        ? '#32CD32' : '#FF6B6B'
                                }))}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek'
                                }}
                            />
                        </div>

                        {/* Settings Modal with updated styles */}
                        {showSettingsModal && (
                            <div className="fixed inset-0 z-50 overflow-y-auto">
                                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                                    <div className="fixed inset-0 transition-opacity">
                                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                    </div>
                                    <div 
                                        className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl"
                                        style={{ zIndex: 51 }}
                                    >
                                        <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Attendance Settings</h2>
                                        <form onSubmit={handleSettingsUpdate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Minimum Attendance Percentage
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.minAttendancePercent}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        minAttendancePercent: parseInt(e.target.value)
                                                    })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Late Threshold (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.lateThreshold}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        lateThreshold: parseInt(e.target.value)
                                                    })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Auto-mark Absent After (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.autoMarkAbsent}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        autoMarkAbsent: parseInt(e.target.value)
                                                    })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Reminder Before Class (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.reminderBefore}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        reminderBefore: parseInt(e.target.value)
                                                    })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSettingsModal(false)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb] focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                                                >
                                                    Save Settings
                                                </button>
                                            </div>
                                        </form>
                                        <button
                                            onClick={() => setShowSettingsModal(false)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceSystem;
