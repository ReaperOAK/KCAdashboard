import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const UserActivity = ({ userId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await ApiService.get(`/users/activity-log.php?user_id=${userId}`);
                setActivities(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch activity logs');
                setLoading(false);
            }
        };

        fetchActivities();
    }, [userId]);

    if (loading) return <div className="text-center py-4">Loading activities...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="border-b pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                        </div>
                    </div>
                    {activity.ip_address && (
                        <p className="text-xs text-gray-500 mt-1">
                            IP: {activity.ip_address}
                        </p>
                    )}
                </div>
            ))}
            {activities.length === 0 && (
                <p className="text-center text-gray-500">No activity logs found</p>
            )}
        </div>
    );
};

export default UserActivity;
