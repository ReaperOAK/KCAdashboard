import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const UserActivityPage = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await ApiService.get(`/users/activity-log.php?page=${page}&limit=${limit}&filter=${filter}`);
                if (response.success) {
                    setActivities(response.data);
                } else {
                    throw new Error(response.message);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch activity logs');
                setLoading(false);
            }
        };

        fetchActivities();
    }, [page, limit, filter]);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Activity Logs</h1>
                <div className="mt-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="rounded-md border-gray-300"
                    >
                        <option value="all">All Activities</option>
                        <option value="login">Logins</option>
                        <option value="update">Updates</option>
                        <option value="permission">Permissions</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : error ? (
                <div className="text-red-500 py-4">{error}</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {activities.map((activity) => (
                            <li key={activity.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.user_name || 'Unknown User'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </p>
                                        {activity.ip_address && (
                                            <p className="text-xs text-gray-400">
                                                IP: {activity.ip_address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="px-6 py-4 flex justify-between items-center border-t">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">Page {page}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={activities.length < limit}
                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserActivityPage;
