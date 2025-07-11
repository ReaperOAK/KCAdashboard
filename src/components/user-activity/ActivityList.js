import React from 'react';
import ActivityItem from './ActivityItem';

/**
 * ActivityList - List of user activities.
 * @param {Object} props
 * @param {Array} props.activities
 */
const ActivityList = React.memo(function ActivityList({ activities }) {
  if (!activities.length) {
    return <p className="text-center text-gray-dark py-6" aria-live="polite">No activity logs found</p>;
  }
  return (
    <ul className="divide-y divide-gray-light" aria-label="Activity log list">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </ul>
  );
});

export default ActivityList;
