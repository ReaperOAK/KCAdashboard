
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { UsersApi } from '../../api/users';

// Loading skeleton (memoized)
const ActivitySkeleton = React.memo(function ActivitySkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading activities">
      <div className="bg-gray-light h-6 w-1/3 rounded" />
      <div className="bg-gray-light h-4 w-2/3 rounded" />
      <div className="bg-gray-light h-4 w-1/2 rounded" />
      <div className="bg-gray-light h-6 w-1/4 rounded" />
    </div>
  );
});

// User details card (memoized)
const UserDetailsCard = React.memo(function UserDetailsCard({ user }) {
  if (!user) return null;
  return (
    <section className="bg-white px-2 sm:px-4 py-3 sm:py-4 rounded-lg shadow-md mb-4" aria-label="User details">
      <h2 className="text-lg sm:text-xl font-semibold text-primary">{user.full_name}</h2>
      <p className="text-gray-dark">{user.email}</p>
    </section>
  );
});

// Activity list item (memoized)
const ActivityItem = React.memo(function ActivityItem({ activity }) {
  return (
    <li className="border-b border-gray-light pb-3 last:border-b-0" tabIndex={0} aria-label={`Activity: ${activity.action}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-primary">{activity.action}</p>
          <p className="text-sm text-gray-dark">{activity.description}</p>
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(activity.created_at).toLocaleString()}
        </div>
      </div>
      {activity.ip_address && (
        <p className="text-xs text-gray-500 mt-1">IP: {activity.ip_address}</p>
      )}
    </li>
  );
});

// Activity list (memoized)
const ActivityList = React.memo(function ActivityList({ activities }) {
  if (!activities.length) {
    return <p className="text-center text-gray-500">No activity logs found</p>;
  }
  return (
    <ul className="divide-y divide-gray-light" aria-label="Activity log list">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </ul>
  );
});

// Main component
function UserActivity({ userId: propUserId }) {
  const { userId: paramUserId } = useParams();
  const userId = propUserId || paramUserId;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [activitiesResponse, userResponse] = await Promise.all([
        UsersApi.getActivityLog(userId),
        !propUserId ? UsersApi.getDetails(userId) : Promise.resolve(null)
      ]);
      setActivities(activitiesResponse.data);
      if (userResponse) setUserData(userResponse.user);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  }, [userId, propUserId]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  if (loading) return <ActivitySkeleton />;
  if (error) return <div className="text-red-600 py-4" role="alert">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      {/* Show user details only in standalone mode */}
      {userData && <UserDetailsCard user={userData} />}
      <section className="bg-white rounded-lg shadow-md" aria-label="User activity history">
        <header className="px-2 sm:px-4 py-3 sm:py-4 border-b border-gray-light">
          <h3 className="text-base sm:text-lg font-medium text-primary">Activity History</h3>
        </header>
        <div className="px-2 sm:px-4 py-3 sm:py-4">
          <ActivityList activities={activities} />
        </div>
      </section>
    </div>
  );
}

export default React.memo(UserActivity);
