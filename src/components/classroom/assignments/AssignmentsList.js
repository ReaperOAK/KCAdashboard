
import React, { useMemo } from 'react';
import AssignmentCard from './AssignmentCard';
import { FileText } from 'lucide-react';

const AssignmentsList = React.memo(({ assignments, onViewSubmissions }) => {
  const assignmentCards = useMemo(() => (
    assignments.length > 0 ? (
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onViewSubmissions={() => onViewSubmissions(assignment)}
          />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in" role="status" aria-live="polite">
        <FileText className="w-10 h-10 text-accent mb-3" aria-hidden="true" />
        <p className="text-xl font-semibold text-text-dark dark:text-text-light mb-2">No assignments created yet.</p>
        <p className="text-base text-gray-dark dark:text-gray-light mt-2 max-w-xs mx-auto">
          Create your first assignment using the <span className="font-bold text-accent">"Create Assignment"</span> button.
        </p>
      </div>
    )
  ), [assignments, onViewSubmissions]);

  return assignmentCards;
});

export default AssignmentsList;
