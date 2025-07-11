import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Badge for batch status (accessible, color contrast from Tailwind config)
const StatusBadge = React.memo(function StatusBadge({ status }) {
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active':
        return 'bg-success text-white';
      case 'completed':
        return 'bg-gray-light text-primary';
      default:
        return 'bg-warning text-white';
    }
  }, [status]);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeClass} transition-colors duration-200`}
      aria-label={`Batch status: ${status}`}
      role="status"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

// Card for a single batch
const BatchCard = React.memo(function BatchCard({ batch, onViewDetails, onManageStudents }) {
  return (
    <div className="bg-background-light rounded-2xl shadow-lg border border-gray-light flex flex-col h-full hover:shadow-xl transition-shadow duration-300 group" role="region" aria-labelledby={`batch-title-${batch.id}`}> 
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 gap-2">
          <h3 id={`batch-title-${batch.id}`} className="text-lg sm:text-xl font-semibold text-primary group-hover:text-accent transition-colors duration-200" tabIndex={0}>
            {batch.name}
          </h3>
          <StatusBadge status={batch.status} />
        </div>
        <p className="text-xs sm:text-sm text-gray-dark mb-2 sm:mb-4 line-clamp-2" aria-label="Batch description">{batch.description}</p>
        <dl className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-dark">
          <div>
            <dt className="inline font-semibold">Level:</dt>{' '}
            <dd className="inline" aria-label="Batch level">{batch.level}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Schedule:</dt>{' '}
            <dd className="inline" aria-label="Batch schedule">{batch.schedule}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Students:</dt>{' '}
            <dd className="inline" aria-label="Student count">{batch.student_count}/{batch.max_students}</dd>
          </div>
        </dl>
      </div>
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-light/40 border-t border-gray-light flex flex-col sm:flex-row justify-between gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-4 py-2 font-medium transition-colors w-full sm:w-auto shadow-sm"
          aria-label={`View details for ${batch.name}`}
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onManageStudents}
          className="bg-accent text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-4 py-2 font-medium transition-colors w-full sm:w-auto shadow-sm"
          aria-label={`Manage students for ${batch.name}`}
        >
          Manage Students
        </button>
      </div>
    </div>
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

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-8"
      aria-label="Batch list"
      role="list"
    >
      {batchCards}
    </section>
  );
});

export default BatchList;
