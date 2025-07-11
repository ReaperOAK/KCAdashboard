
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UsersApi } from '../../api/users';
import FilterSelect from '../../components/user-activity/FilterSelect';
import ActivityList from '../../components/user-activity/ActivityList';
import Pagination from '../../components/user-activity/Pagination';
import ActivitySkeleton from '../../components/user-activity/ActivitySkeleton';

function UserActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsersApi.getActivityLogs({ page, limit, filter });
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
  }, [page, filter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const hasNext = useMemo(() => activities.length === limit, [activities.length]);

  // Named handler for filter change
  const handleFilterChange = useCallback((e) => setFilter(e.target.value), []);

  return (
    <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl text-text-dark font-semibold mb-1">User Activity Logs</h1>
        <div className="mt-2 sm:mt-4">
          <FilterSelect value={filter} onChange={handleFilterChange} />
        </div>
      </div>
      {loading ? (
        <ActivitySkeleton />
      ) : error ? (
        <div className="text-white bg-red-700 border border-red-800 rounded py-4 px-2" role="alert" aria-live="polite">{error}</div>
      ) : (
        <div className="bg-background-light dark:bg-background-dark shadow-md rounded-md overflow-hidden border border-gray-light transition-all duration-200">
          <ActivityList activities={activities} />
          <Pagination page={page} setPage={setPage} hasNext={hasNext} />
        </div>
      )}
    </div>
  );
}

export default React.memo(UserActivityPage);
