
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { UsersApi } from '../../api/users';
import ActivitySkeleton from '../../components/user-activity/ActivitySkeleton';
import UserDetailsCard from '../../components/user-activity/UserDetailsCard';
import ActivityList from '../../components/user-activity/ActivityList';

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
  if (error) return <div className="text-white bg-red-700 border border-red-800 rounded py-4 px-2" role="alert" aria-live="polite">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      {/* Show user details only in standalone mode */}
      {userData && <UserDetailsCard user={userData} />}
      <section className="bg-background-light dark:bg-background-dark rounded-lg shadow-md border border-gray-light transition-all duration-200" aria-label="User activity history">
        <header className="px-2 sm:px-4 py-3 sm:py-4 border-b border-gray-dark">
          <h3 className="text-2xl text-text-dark font-semibold">Activity History</h3>
        </header>
        <div className="px-2 sm:px-4 py-3 sm:py-4">
          <ActivityList activities={activities} />
        </div>
      </section>
    </div>
  );
}

export default React.memo(UserActivity);
