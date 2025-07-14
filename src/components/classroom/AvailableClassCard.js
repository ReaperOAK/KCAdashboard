import React from 'react';
import { UserPlus2, CheckCircle, Loader2 } from 'lucide-react';


const AvailableClassCard = React.memo(({ classroom, enrolling, enrollSuccess, enrollError, onEnroll }) => (
  <section
    className="bg-background-light dark:bg-background-dark border-2 border-dashed border-gray-light rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col h-full animate-fade-in"
    aria-label={classroom.name}
  >
    <div className="p-5 sm:p-6 flex-1 flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold text-secondary mb-2 flex items-center gap-2">
        <UserPlus2 className="w-5 h-5 text-accent" aria-hidden="true" />
        <span className="truncate" title={classroom.name}>{classroom.name}</span>
      </h2>
      <p className="text-gray-dark dark:text-gray-light mb-4 line-clamp-3">{classroom.description}</p>
      <div className="text-sm text-gray-dark dark:text-gray-light mb-4 space-y-1">
        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
        <p><span className="font-semibold">Level:</span> {classroom.level}</p>
        <p><span className="font-semibold">Availability:</span> <span className="ml-1 text-green-600 font-semibold">{classroom.available_slots} slots left</span></p>
      </div>
      <button
        onClick={() => onEnroll(classroom.id)}
        disabled={enrolling === classroom.id}
        className={[
          'w-full px-4 py-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-all duration-200',
          'bg-accent text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        ].join(' ')}
        aria-label={`Enroll in ${classroom.name}`}
      >
        {enrolling === classroom.id ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : enrollSuccess === classroom.id ? (
          <CheckCircle className="w-5 h-5 text-success" />
        ) : (
          <UserPlus2 className="w-5 h-5" />
        )}
        {enrolling === classroom.id ? 'Enrolling...' : enrollSuccess === classroom.id ? 'Enrolled!' : 'Enroll Now'}
      </button>
      {enrollError && enrolling === classroom.id && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400 animate-fade-in" aria-live="polite">{enrollError}</p>
      )}
    </div>
  </section>
));

export default AvailableClassCard;
