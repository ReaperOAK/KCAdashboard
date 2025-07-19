import React from 'react';

const TabButton = React.memo(function TabButton({ isActive, onClick, children, badge, ariaLabel }) {
  return (
    <button
      type="button"
      role="tab"
      className={`px-5 sm:px-6 py-2 sm:py-3 bg-transparent border-none cursor-pointer text-base sm:text-lg transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg ${
        isActive
          ? 'text-primary font-bold after:content-["""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-primary'
          : 'text-gray-dark hover:bg-background-light hover:text-primary'
      }`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <span className="flex items-center gap-2">
        {children}
        {badge && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs font-semibold flex items-center gap-1">
            {/* Lucide icon: Dot (optional visual cue) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
            {badge}
          </span>
        )}
      </span>
    </button>
  );
});

export default TabButton;
