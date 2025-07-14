import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Badge for batch status (accessible, color contrast from Tailwind config)
const StatusBadge = React.memo(function StatusBadge({ status }) {
  // Use color tokens from design system
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active':
        return 'bg-accent text-white';
      case 'completed':
        return 'bg-gray-light text-primary';
      case 'inactive':
        return 'bg-highlight text-white';
      default:
        return 'bg-warning text-white';
    }
  }, [status]);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeClass} transition-all duration-200`}
      aria-label={`Batch status: ${status}`}
      role="status"
    >
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
});

// Card for a single batch
const BatchCard = React.memo(function BatchCard({ batch, onViewDetails, onManageStudents }) {
  return (
    <article
      className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg border border-gray-light flex flex-col h-full hover:shadow-2xl hover:border-accent focus-within:ring-2 focus-within:ring-accent transition-all duration-300 group outline-none"
      role="region"
      aria-labelledby={`batch-title-${batch.id}`}
      tabIndex={0}
    >
      <header className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2">
          <h3 id={`batch-title-${batch.id}`} className="text-lg sm:text-xl font-semibold text-primary group-hover:text-accent transition-colors duration-200 truncate" tabIndex={0}>
            {batch.name}
          </h3>
          <StatusBadge status={batch.status} />
        </div>
        <p className="text-xs sm:text-sm text-gray-dark mb-2 sm:mb-4 line-clamp-2" aria-label="Batch description">{batch.description || <span className="italic text-gray-light">No description provided.</span>}</p>
        <dl className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-dark">
          <div>
            <dt className="inline font-semibold text-text-dark">Level:</dt>{' '}
            <dd className="inline" aria-label="Batch level">{batch.level || <span className="text-gray-light">N/A</span>}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-text-dark">Schedule:</dt>{' '}
            <dd className="inline" aria-label="Batch schedule">{batch.schedule || <span className="text-gray-light">N/A</span>}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-text-dark">Students:</dt>{' '}
            <dd className="inline" aria-label="Student count">{typeof batch.student_count === 'number' && typeof batch.max_students === 'number' ? `${batch.student_count}/${batch.max_students}` : <span className="text-gray-light">N/A</span>}</dd>
          </div>
        </dl>
      </header>
      <footer className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-light/40 border-t border-gray-light flex flex-col sm:flex-row justify-between gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-4 py-2 font-medium transition-all w-full sm:w-auto shadow-sm"
          aria-label={`View details for ${batch.name}`}
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onManageStudents}
          className="bg-accent text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-4 py-2 font-medium transition-all w-full sm:w-auto shadow-sm"
          aria-label={`Manage students for ${batch.name}`}
        >
          Manage Students
        </button>
      </footer>
    </article>
  );
});

// Main batch list grid
export const BatchList = React.memo(function BatchList({ batches, onManageStudents }) {
  const navigate = useNavigate();

  // Memoize handlers to avoid unnecessary re-renders
  const handleViewDetails = useCallback(
    (id) => () => {
      navigate(`/teacher/batches/${id}`);
    },
    [navigate]
  );

  const handleManageStudents = useCallback(
    (batch) => () => {
      onManageStudents(batch);
    },
    [onManageStudents]
  );

  // Memoize batch cards for performance
  const batchCards = useMemo(
    () =>
      batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          onViewDetails={handleViewDetails(batch.id)}
          onManageStudents={handleManageStudents(batch)}
        />
      )),
    [batches, handleViewDetails, handleManageStudents]
  );

  if (!batches || batches.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[200px] bg-background-light rounded-xl shadow border border-gray-light p-8" aria-label="No batches found">
        <span className="text-xl text-gray-dark font-medium mb-2">No batches found</span>
        <span className="text-gray-light">You have not created or joined any batches yet.</span>
      </section>
    );
  }

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8"
      aria-label="Batch list"
      role="list"
    >
      {batchCards}
    </section>
  );
});

export default BatchList;
