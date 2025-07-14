
import React from 'react';

/**
 * ActivityItem - Pure, accessible, responsive, and beautiful UI for a user activity list item.
 * @param {Object} props
 * @param {Object} props.activity
 */
const ActivityItem = React.memo(function ActivityItem({ activity }) {
  // Format date for readability (SRP: could extract to a util if reused)
  const formattedDate = new Date(activity.created_at).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <li
      className="group bg-background-light dark:bg-background-dark border-b border-gray-dark last:border-b-0 px-4 py-3 sm:px-6 transition-all duration-200 hover:bg-gray-light/60 focus-within:bg-gray-light/80 rounded-md shadow-sm flex flex-col gap-1 "
      tabIndex={0}
      aria-label={`Activity: ${activity.action}`}
      
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
        <div className="flex-1 min-w-0">
          <span className="inline-block font-semibold text-primary text-base truncate" title={activity.action}>
            {activity.action}
          </span>
          <p className="text-sm text-text-dark mt-0.5 truncate" title={activity.description}>
            {activity.description}
          </p>
        </div>
        <time
          className="text-xs text-gray-dark font-mono ml-0 sm:ml-4 mt-1 sm:mt-0 whitespace-nowrap"
          dateTime={activity.created_at}
        >
          {formattedDate}
        </time>
      </div>
      {activity.ip_address && (
        <div className="flex items-center gap-1 mt-1">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
          <span className="text-xs text-gray-dark" title={`IP: ${activity.ip_address}`}>IP: {activity.ip_address}</span>
        </div>
      )}
    </li>
  );
});

export default ActivityItem;
