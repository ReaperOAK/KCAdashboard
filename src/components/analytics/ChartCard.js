import React from 'react';

// Enhanced ChartCard: beautiful, responsive, accessible, and focused
const ChartCard = React.memo(function ChartCard({ title, children }) {
  return (
    <section
      className="relative bg-background-light dark:bg-background-dark rounded-2xl shadow-lg border border-gray-light dark:border-gray-dark p-4 sm:p-6 md:p-8 transition-all duration-300 overflow-hidden group"
      aria-label={title ? `${title} chart card` : 'Chart card'}
      tabIndex={0}
    >
      {/* Accent border left */}
      <span className="absolute left-0 top-4 bottom-4 w-1 bg-accent rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
      <header className="mb-3 sm:mb-4 flex items-center gap-2">
        <h2 className="text-xl md:text-2xl font-semibold text-primary dark:text-text-light tracking-tight">
          {title}
        </h2>
      </header>
      <div className="w-full">
        {children}
      </div>
    </section>
  );
});

export default ChartCard;
