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
    <nav aria-label="Classroom views" className="flex space-x-2">
      {views.map(view => (
        <button
          key={view.key}
          type="button"
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors ${currentView === view.key ? 'bg-secondary text-white' : 'bg-gray-light text-secondary hover:bg-secondary hover:text-white'}`}
          aria-current={currentView === view.key ? 'page' : undefined}
          onClick={() => onSwitch(view.key)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
};
export default React.memo(ViewSwitcher);
