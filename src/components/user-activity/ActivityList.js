
import React from 'react';
import ActivityItem from './ActivityItem';

/**
 * ActivityList - Renders a beautiful, accessible, responsive list of user activities.
 * @param {Object} props
 * @param {Array} props.activities
 */
const ActivityList = React.memo(function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-fade-in" aria-live="polite">
        <svg className="w-14 h-14 text-gray-light mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
        <p className="text-center text-gray-dark text-lg font-medium">No activity logs found</p>
      </div>
    );
  }
  return (
    <ul
      className="w-full max-w-2xl mx-auto bg-background-light dark:bg-background-dark rounded-lg shadow-md border border-gray-light divide-y divide-gray-light p-0 sm:p-2 animate-fade-in"
      aria-label="Activity log list"

    >
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </ul>
  );
});

export default ActivityList;
