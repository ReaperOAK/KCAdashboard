import React from 'react';

const TabNav = React.memo(({ activeTab, onTabChange }) => (
  <div className="flex space-x-4" role="tablist">
    {['tickets', 'faqs', 'leaves'].map(tab => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent \
          ${activeTab === tab ? 'bg-secondary text-white shadow' : 'bg-background-light text-secondary border border-accent hover:bg-accent hover:text-white'}`}
        role="tab"
        aria-selected={activeTab === tab}
        tabIndex={0}
      >
        {tab === 'tickets' ? 'Tickets' : tab === 'faqs' ? 'FAQs' : 'Leave Requests'}
      </button>
    ))}
  </div>
));

export default TabNav;
