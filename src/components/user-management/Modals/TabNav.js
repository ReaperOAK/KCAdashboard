import React, { memo } from 'react';


const TabNav = memo(function TabNav({ activeTab, onTabChange, tabs }) {
  return (
    <nav className="border-b border-gray-light mb-3 sm:mb-4" role="tablist" aria-label="User modal tabs">
      <ul className="flex -mb-px space-x-2 sm:space-x-6 overflow-x-auto">
        {tabs.map(tab => (
          <li key={tab.key} className="flex-1 min-w-[120px]">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={onTabChange[tab.key]}
              className={[
                'py-2 px-2 sm:px-4 w-full text-center rounded-t-lg transition-all duration-200 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                activeTab === tab.key
                  ? 'border-b-2 border-accent text-accent bg-background-light shadow-sm'
                  : 'text-gray-dark hover:text-accent hover:bg-gray-light'
              ].join(' ')}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
});

export default TabNav;
