import React from 'react';
/**
 * Card for displaying classroom details and actions.
 * Beautiful, responsive, and accessible.
 */
const ClassroomCard = ({ classroom, onCardClick, onSchedule, onAssignment, onMaterials }) => (
  <section
    className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-200 border border-gray-light animate-fade-in w-full max-w-xl mx-auto"
    tabIndex={0}
    aria-label={`Classroom: ${classroom.name}`}
    onClick={() => onCardClick(classroom)}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { onCardClick(classroom); } }}
    role="button"
  >
    <div className="p-5 sm:p-6">
      <h3 className="text-xl md:text-2xl font-bold text-primary mb-3 break-words" title={classroom.name}>{classroom.name}</h3>
      <p className="text-base md:text-lg text-gray-dark dark:text-gray-light mb-4 leading-relaxed break-words whitespace-pre-line">
        {classroom.description}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-base">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-secondary">Students:</span>
          <span className="text-primary dark:text-text-light font-medium">{classroom.student_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-secondary">Next Class:</span>
          <span className="text-primary dark:text-text-light font-medium">
            {classroom.next_session || <span className="italic text-gray-light dark:text-gray-dark">Not scheduled</span>}
          </span>
        </div>
      </div>
    </div>
    <div className="px-5 sm:px-6 py-4 bg-gray-light dark:bg-background-dark border-t border-gray-light flex flex-wrap gap-2 justify-between">
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onSchedule(); }}
        className="bg-secondary text-white hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-3 py-1 text-sm font-semibold transition-all duration-200 shadow-sm"
        aria-label={`Schedule class for ${classroom.name}`}
      >
        Schedule Class
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onAssignment(); }}
        className="bg-secondary text-white hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-3 py-1 text-sm font-semibold transition-all duration-200 shadow-sm"
        aria-label={`Create assignment for ${classroom.name}`}
      >
        Create Assignment
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onMaterials(); }}
        className="bg-secondary text-white hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-3 py-1 text-sm font-semibold transition-all duration-200 shadow-sm"
        aria-label={`Add materials for ${classroom.name}`}
      >
        Add Materials
      </button>
    </div>
  </section>
);
export default React.memo(ClassroomCard);
