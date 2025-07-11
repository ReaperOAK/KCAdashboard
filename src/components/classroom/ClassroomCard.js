import React from 'react';
/**
 * Card for displaying classroom details and actions.
 * Beautiful, responsive, and accessible.
 */
const ClassroomCard = ({ classroom, onCardClick, onSchedule, onAssignment, onMaterials }) => (
  <div
    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
    tabIndex={0}
    aria-label={`Classroom: ${classroom.name}`}
    onClick={() => onCardClick(classroom)}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { onCardClick(classroom); } }}
    role="button"
  >
    <div className="p-6">
      <h3 className="text-xl font-semibold text-secondary mb-2">{classroom.name}</h3>
      <p className="text-gray-dark mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-dark">
        <p><span className="font-semibold">Students:</span> {classroom.student_count}</p>
        <p><span className="font-semibold">Next Class:</span> {classroom.next_session || 'Not scheduled'}</p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-light border-t flex flex-wrap gap-2 justify-between">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onSchedule(); }}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1 transition-all duration-200"
        aria-label={`Schedule class for ${classroom.name}`}
      >
        Schedule Class
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onAssignment(); }}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1 transition-all duration-200"
        aria-label={`Create assignment for ${classroom.name}`}
      >
        Create Assignment
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onMaterials(); }}
        className="text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1 transition-all duration-200"
        aria-label={`Add materials for ${classroom.name}`}
      >
        Add Materials
      </button>
    </div>
  </div>
);
export default React.memo(ClassroomCard);
