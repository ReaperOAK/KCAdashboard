
import React from 'react';

/**
 * TabNav component: Shows a beautiful, accessible, responsive tab navigation UI.
 * Only responsibility: Display tab navigation and handle tab change action.
 *
 * Props:
 *   - activeTab: string (required)
 *   - onTabChange: function (required)
 */
const tabs = [
  { key: 'tickets', label: 'Tickets', icon: (
    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
  ) },
  { key: 'faqs', label: 'FAQs', icon: (
    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10h.01M16 10h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
  ) },
  { key: 'leaves', label: 'Leave Requests', icon: (
    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 6h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" /></svg>
  ) },
];

const TabNav = React.memo(function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex flex-wrap gap-2 sm:gap-4 justify-center items-center w-full mb-4" role="tablist" aria-label="Support Tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent text-base sm:text-lg \
            ${activeTab === tab.key
              ? 'bg-secondary text-white shadow-lg scale-105'
              : 'bg-background-light text-secondary border border-accent hover:bg-accent hover:text-white'}
          `}
          role="tab"
          aria-selected={activeTab === tab.key}
          tabIndex={activeTab === tab.key ? 0 : -1}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
});

export default TabNav;
