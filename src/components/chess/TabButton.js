import React from 'react';

const TabButton = React.memo(function TabButton({ isActive, onClick, children, badge, ariaLabel }) {
  return (
    <button
      type="button"
      className={`px-6 py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive
          ? 'text-primary font-bold after:content-["""] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-primary'
          : 'text-gray-dark hover:bg-background-light'
      }`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {children}
      {badge}
    </button>
  );
});

export default TabButton;
