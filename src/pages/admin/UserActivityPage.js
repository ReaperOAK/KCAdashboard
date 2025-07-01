
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';

// Filter select (memoized)
const FilterSelect = React.memo(function FilterSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-md border-gray-light focus:border-accent focus:ring-accent"
      aria-label="Filter activity type"
    >
      <option value="all">All Activities</option>
      <option value="login">Logins</option>
      <option value="update">Updates</option>
      <option value="permission">Permissions</option>
    </select>
  );
});

// Activity list item (memoized)
const ActivityListItem = React.memo(function ActivityListItem({ activity }) {
  return (
    <li className="px-2 py-2 sm:px-4 sm:py-3" tabIndex={0} aria-label={`Activity by ${activity.user_name || 'Unknown User'}`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{activity.user_name || 'Unknown User'}</p>
          <p className="text-sm text-gray-dark">{activity.action}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
          {activity.ip_address && (
            <p className="text-xs text-gray-500">IP: {activity.ip_address}</p>
          )}
        </div>
      </div>
    </li>
  );
});

// Activity list (memoized)
const ActivityList = React.memo(function ActivityList({ activities }) {
  if (!activities.length) {
    return <p className="text-center text-gray-500">No activity logs found</p>;
  }
  return (
    <ul className="divide-y divide-gray-light" aria-label="User activity log list">
      {activities.map((activity) => (
        <ActivityListItem key={activity.id} activity={activity} />
      ))}
    </ul>
  );
});

// Pagination controls (memoized)
const Pagination = React.memo(function Pagination({ page, setPage, hasNext }) {
  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), [setPage]);
  const handleNext = useCallback(() => setPage((p) => p + 1), [setPage]);
  return (
    <div className="px-2 py-2 sm:px-4 sm:py-3 flex justify-between items-center border-t border-gray-light">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-4 py-2 border border-gray-light rounded-md disabled:opacity-50 bg-white text-primary hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="text-sm text-gray-dark">Page {page}</span>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="px-4 py-2 border border-gray-light rounded-md disabled:opacity-50 bg-white text-primary hover:bg-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
});

// Loading skeleton (memoized)
const ActivitySkeleton = React.memo(function ActivitySkeleton() {
  return (
    <div className="text-center py-4 animate-pulse" aria-busy="true" aria-label="Loading activities">
      <div className="h-6 w-1/3 mx-auto bg-gray-light rounded mb-2" />
      <div className="h-4 w-2/3 mx-auto bg-gray-light rounded mb-2" />
      <div className="h-4 w-1/2 mx-auto bg-gray-light rounded mb-2" />
    </div>
  );
});

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
        <h1 className="text-xl sm:text-2xl font-bold text-primary">User Activity Logs</h1>
        <div className="mt-2 sm:mt-4">
          <FilterSelect value={filter} onChange={handleFilterChange} />
        </div>
      </div>
      {loading ? (
        <ActivitySkeleton />
      ) : error ? (
        <div className="text-red-600 py-4" role="alert">{error}</div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <ActivityList activities={activities} />
          <Pagination page={page} setPage={setPage} hasNext={hasNext} />
        </div>
      )}
    </div>
  );
}

export default React.memo(UserActivityPage);
