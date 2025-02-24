import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const AttendanceSettings = () => {
    const [settings, setSettings] = useState({
        minAttendancePercent: 75,
        lateThreshold: 15,
        autoMarkAbsent: 30,
        reminderBefore: 60,
        zoom_api_key: '',
        zoom_api_secret: '',
        google_meet_credentials: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await ApiService.get('/attendance/get-settings.php');
                if (response.success && response.settings) {
                    setSettings(response.settings);
                }
            } catch (error) {
                setError('Failed to load settings');
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await ApiService.post('/attendance/update-settings.php', settings);
        } catch (error) {
            setError('Failed to save settings');
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-[#200e4a] mb-6">Attendance Settings</h2>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Attendance Percentage
                        </label>
                        <input
                            type="number"
                            value={settings.minAttendancePercent}
                            onChange={(e) => setSettings({
                                ...settings,
                                minAttendancePercent: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            min="0"
                            max="100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Late Threshold (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.lateThreshold}
                            onChange={(e) => setSettings({
                                ...settings,
                                lateThreshold: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Auto-mark Absent After (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.autoMarkAbsent}
                            onChange={(e) => setSettings({
                                ...settings,
                                autoMarkAbsent: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reminder Before Class (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.reminderBefore}
                            onChange={(e) => setSettings({
                                ...settings,
                                reminderBefore: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zoom API Key
                        </label>
                        <input
                            type="password"
                            value={settings.zoom_api_key}
                            onChange={(e) => setSettings({
                                ...settings,
                                zoom_api_key: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zoom API Secret
                        </label>
                        <input
                            type="password"
                            value={settings.zoom_api_secret}
                            onChange={(e) => setSettings({
                                ...settings,
                                zoom_api_secret: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] 
                            ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceSettings;
