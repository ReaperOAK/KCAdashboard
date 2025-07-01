import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Badge for batch status (accessible, color contrast from Tailwind config)
const StatusBadge = React.memo(function StatusBadge({ status }) {
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-light text-primary';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }, [status]);
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}
      aria-label={`Batch status: ${status}`}
      role="status"
    >
      {status}
    </span>
  );
});

// Card for a single batch
const BatchCard = React.memo(function BatchCard({ batch, onViewDetails, onManageStudents }) {
  return (
    <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-md border border-gray-light flex flex-col h-full" role="region" aria-labelledby={`batch-title-${batch.id}`}> 
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 id={`batch-title-${batch.id}`} className="text-xl font-semibold text-primary" tabIndex={0}>
            {batch.name}
          </h3>
          <StatusBadge status={batch.status} />
        </div>
        <p className="text-gray-dark mb-4 line-clamp-2" aria-label="Batch description">{batch.description}</p>
        <dl className="space-y-2 text-sm text-gray-dark">
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
      <div className="px-6 py-4 bg-gray-light/40 border-t border-gray-light flex justify-between gap-2">
        <button
          type="button"
          onClick={onViewDetails}
          className="bg-transparent text-secondary hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1 font-medium transition-colors"
          aria-label={`View details for ${batch.name}`}
        >
          View Details
        </button>
        <button
          type="button"
          onClick={onManageStudents}
          className="bg-transparent text-secondary hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-2 py-1 font-medium transition-colors"
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-label="Batch list"
      role="list"
    >
      {batchCards}
    </section>
  );
});

export default BatchList;
