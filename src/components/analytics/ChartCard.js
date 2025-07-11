import React from 'react';

const ChartCard = React.memo(function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-light transition-all duration-200">
      <h2 className="text-lg sm:text-xl font-semibold text-secondary mb-3 sm:mb-4">{title}</h2>
      {children}
    </div>
  );
});

export default ChartCard;
