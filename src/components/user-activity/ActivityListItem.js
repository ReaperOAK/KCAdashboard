import React from 'react';

/**
 * ActivityListItem - List item for a user activity (page view).
 * @param {Object} props
 * @param {Object} props.activity
 */
const ActivityListItem = React.memo(function ActivityListItem({ activity }) {
  return (
    <li className="px-2 py-2 sm:px-4 sm:py-3 transition-all duration-200" tabIndex={0} aria-label={`Activity by ${activity.user_name || 'Unknown User'}`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{activity.user_name || 'Unknown User'}</p>
          <p className="text-sm text-text-dark">{activity.action}</p>
          <p className="text-xs text-gray-dark mt-1">{activity.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-dark">{new Date(activity.created_at).toLocaleString()}</p>
          {activity.ip_address && (
            <p className="text-xs text-gray-dark">IP: {activity.ip_address}</p>
          )}
        </div>
      </div>
    </li>
  );
});

export default ActivityListItem;
