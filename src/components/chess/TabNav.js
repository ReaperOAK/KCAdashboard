
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
        <nav className="-mb-px flex overflow-x-auto no-scrollbar space-x-3 sm:space-x-6">
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
                  `group inline-flex items-center py-2 sm:py-3 px-3 sm:px-5 border-b-2 font-medium text-base sm:text-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap rounded-t-lg ` +
                  (activeTab === tab.id
                    ? 'border-accent text-accent bg-background-light dark:bg-background-dark '
                    : 'border-transparent text-gray-dark hover:text-accent hover:border-accent hover:bg-background-light/60')
                }
              >
                {Icon && <Icon className="w-5 h-5 mr-2" aria-hidden="true" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-3 sm:mt-4">
          <p className="text-sm text-gray-dark flex items-center gap-2">
            {/* Lucide icon: Info (optional visual cue for description) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" /></svg>
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>
    );
  }
  // Otherwise, render children (legacy usage)
  return (
    <div className="border-b border-gray-light" role="tablist">
      <nav className="-mb-px flex overflow-x-auto no-scrollbar space-x-3 sm:space-x-6">
        {children}
      </nav>
    </div>
  );
});

export default TabNav;
