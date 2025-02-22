import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../utils/api';

const UserActivity = ({ userId: propUserId }) => {
    const { userId: paramUserId } = useParams();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    // Use userId from props if provided, otherwise use from URL params
    const userId = propUserId || paramUserId;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [activitiesResponse, userResponse] = await Promise.all([
                    ApiService.get(`/users/activity-log.php?user_id=${userId}`),
                    // Only fetch user details if we're in standalone mode
                    !propUserId ? ApiService.get(`/users/get-details.php?id=${userId}`) : Promise.resolve(null)
                ]);

                setActivities(activitiesResponse.data);
                if (userResponse) {
                    setUserData(userResponse.user);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId, propUserId]);

    if (loading) return <div className="text-center py-4">Loading activities...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;

    return (
        <div className="space-y-4">
            {/* Show user details only in standalone mode */}
            {userData && (
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">{userData.full_name}</h2>
                    <p className="text-gray-600">{userData.email}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-medium">Activity History</h3>
                </div>
                
                <div className="p-4 space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-center text-gray-500">No activity logs found</p>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="border-b pb-3 last:border-b-0">
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserActivity;
