import React, { useMemo } from 'react';
/**
 * View switcher for classroom management (calendar, materials, assignments).
 * Accessible and beautiful.
 */

const ViewSwitcher = ({ currentView, onSwitch }) => {
  const views = useMemo(() => [
    { key: 'calendar', label: 'Calendar' },
    { key: 'materials', label: 'Materials' },
    { key: 'assignments', label: 'Assignments' },
  ], []);
  return (
    <nav aria-label="Classroom views" className="flex flex-wrap gap-2">
      {views.map(view => {
        const isActive = currentView === view.key;
        return (
          <button
            key={view.key}
            type="button"
            className={[
              'px-4 py-2 rounded-full font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent',
              isActive
                ? 'bg-secondary text-white shadow-md'
                : 'bg-gray-light text-secondary dark:bg-gray-dark dark:text-text-light hover:bg-secondary hover:text-white',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Switch to ${view.label} view`}
            onClick={() => onSwitch(view.key)}
          >
            {view.label}
          </button>
        );
      })}
    </nav>
  );
};

export default React.memo(ViewSwitcher);
