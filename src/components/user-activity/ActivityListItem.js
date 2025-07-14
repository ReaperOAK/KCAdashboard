
import React from 'react';

/**
 * ActivityListItem - Beautiful, accessible, responsive list item for a user activity (page view).
 * @param {Object} props
 * @param {Object} props.activity
 */
const ActivityListItem = React.memo(function ActivityListItem({ activity }) {
  const formattedDate = new Date(activity.created_at).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <li
      className="group bg-background-light dark:bg-background-dark border-b border-gray-dark last:border-b-0 px-4 py-3 sm:px-6 transition-all duration-200 hover:bg-gray-light/60 focus-within:bg-gray-light/80 rounded-md flex flex-col gap-1 animate-fade-in"
      tabIndex={0}
      aria-label={`Activity by ${activity.user_name || 'Unknown User'}: ${activity.action}`}
      role="listitem"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
        <div className="flex-1 min-w-0">
          <span className="inline-block font-semibold text-primary text-base truncate" title={activity.user_name || 'Unknown User'}>
            {activity.user_name || 'Unknown User'}
          </span>
          <p className="text-sm text-text-dark mt-0.5 truncate" title={activity.action}>
            {activity.action}
          </p>
          <p className="text-xs text-gray-dark mt-1 truncate" title={activity.description}>
            {activity.description}
          </p>
        </div>
        <div className="text-right min-w-[120px] flex flex-col items-end gap-1 mt-2 sm:mt-0">
          <time
            className="text-xs text-gray-dark font-mono whitespace-nowrap"
            dateTime={activity.created_at}
          >
            {formattedDate}
          </time>
          {activity.ip_address && (
            <span className="flex items-center gap-1 text-xs text-gray-dark" title={`IP: ${activity.ip_address}`}> 
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
              IP: {activity.ip_address}
            </span>
          )}
        </div>
      </div>
    </li>
  );
});

export default ActivityListItem;
