import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
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

    const fetchAttendanceData = useCallback(async () => {
        try {
            const response = await ApiService.get(`/attendance/get-all.php?batch=${selectedBatch}`);
            setAttendanceData(response.attendance);
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

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
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
                                events={attendanceData.map(item => ({
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

                        {/* Settings Modal */}
                        {showSettingsModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-xl p-6 max-w-lg w-full">
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
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowSettingsModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                            >
                                                Save Settings
                                            </button>
                                        </div>
                                    </form>
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
