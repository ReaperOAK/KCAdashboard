
import React from 'react';

/**
 * TabNav for PGNManagementPage
 * Renders dynamic tabs with icons and descriptions, using design tokens.
 */

const TabNav = React.memo((props) => {
  const { activeTab, onTabChange, tabs, children } = props;
  // If tabs prop is provided, render dynamic tab bar (PGN style)
  if (Array.isArray(tabs) && tabs.length > 0) {
    return (
      <div className="border-b border-gray-light" role="tablist" aria-label="PGN management tabs">
        <nav className="-mb-px flex overflow-x-auto no-scrollbar space-x-4 sm:space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                className={
                  `group inline-flex items-center py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap ` +
                  (activeTab === tab.id
                    ? 'border-accent text-accent '
                    : 'border-transparent text-gray-dark hover:text-accent hover:border-accent')
                }
              >
                {Icon && <Icon className="w-5 h-5 mr-2" aria-hidden="true" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-3 sm:mt-4">
          <p className="text-sm text-gray-dark">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>
    );
  }
  // Otherwise, render children (legacy usage)
  return (
    <div className="border-b border-gray-light" role="tablist">
      <nav className="-mb-px flex overflow-x-auto no-scrollbar space-x-4 sm:space-x-8">
        {children}
      </nav>
    </div>
  );
});

export default TabNav;
