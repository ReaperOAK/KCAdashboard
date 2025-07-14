
import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * BatchInfoCard: Displays batch details in a beautiful, accessible, responsive card.
 * Uses Tailwind color tokens and semantic HTML.
 */
const BatchInfoCard = React.memo(function BatchInfoCard({ batch }) {
  if (!batch) {
    return (
      <section className="bg-background-light dark:bg-background-dark rounded-xl shadow-md border border-gray-light p-6 flex flex-col items-center justify-center min-h-[120px] mb-6 animate-pulse">
        <span className="text-gray-dark text-lg">Loading batch info...</span>
      </section>
    );
  }

  return (
    <section
      className="bg-background-light dark:bg-background-dark rounded-xl shadow-md border border-gray-light overflow-hidden mb-6 transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-accent"
      aria-label="Batch Information Card"
      tabIndex={0}
    >
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 pb-2 border-b border-gray-light">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl text-primary font-semibold mb-1 truncate" title={batch.name}>{batch.name || 'Batch'}</h2>
          <StatusBadge status={batch.status} />
        </div>
        {/* Optionally, add an icon or action button here */}
      </header>
      <div className="p-6 pt-4 flex flex-col sm:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-gray-dark text-base mb-3">{batch.description || <span className="italic text-gray-light">No description provided.</span>}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-dark">
            <div>
              <dt className="font-semibold text-text-dark">Level</dt>
              <dd className="ml-1">{batch.level || <span className="text-gray-light">N/A</span>}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-dark">Schedule</dt>
              <dd className="ml-1">{batch.schedule || <span className="text-gray-light">N/A</span>}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-dark">Students</dt>
              <dd className="ml-1">{typeof batch.student_count === 'number' && typeof batch.max_students === 'number' ? `${batch.student_count}/${batch.max_students}` : <span className="text-gray-light">N/A</span>}</dd>
            </div>
            {/* Add more fields as needed */}
          </dl>
        </div>
      </div>
    </section>
  );
});

export default BatchInfoCard;
