import React from 'react';

/**
 * ActivityItem - List item for a user activity.
 * @param {Object} props
 * @param {Object} props.activity
 */
const ActivityItem = React.memo(function ActivityItem({ activity }) {
  return (
    <li className="border-b border-gray-dark pb-3 last:border-b-0 transition-all duration-200" tabIndex={0} aria-label={`Activity: ${activity.action}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-primary">{activity.action}</p>
          <p className="text-sm text-text-dark">{activity.description}</p>
        </div>
        <div className="text-sm text-gray-dark whitespace-nowrap">{new Date(activity.created_at).toLocaleString()}</div>
      </div>
      {activity.ip_address && (
        <p className="text-xs text-gray-dark mt-1">IP: {activity.ip_address}</p>
      )}
    </li>
  );
});

export default ActivityItem;
