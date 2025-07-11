import React from 'react';
import { UserPlus2, CheckCircle, Loader2 } from 'lucide-react';

const AvailableClassCard = React.memo(({ classroom, enrolling, enrollSuccess, enrollError, onEnroll }) => (
  <div className="bg-white border-2 border-dashed border-gray-light rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full" role="region" aria-label={classroom.name}>
    <div className="p-6 flex-1">
      <h2 className="text-xl font-bold text-secondary mb-2 flex items-center gap-2">
        <UserPlus2 className="w-5 h-5 text-accent" aria-hidden="true" />
        {classroom.name}
      </h2>
      <p className="text-gray-dark mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-dark mb-4 space-y-1">
        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
        <p><span className="font-semibold">Level:</span> {classroom.level}</p>
        <p><span className="font-semibold">Availability:</span> <span className="ml-1 text-green-600">{classroom.available_slots} slots left</span></p>
      </div>
      <button
        onClick={() => onEnroll(classroom.id)}
        disabled={enrolling === classroom.id}
        className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all"
        aria-label={`Enroll in ${classroom.name}`}
      >
        {enrolling === classroom.id ? <Loader2 className="animate-spin w-5 h-5" /> : enrollSuccess === classroom.id ? <CheckCircle className="w-5 h-5 text-success" /> : <UserPlus2 className="w-5 h-5" />}
        {enrolling === classroom.id ? 'Enrolling...' : enrollSuccess === classroom.id ? 'Enrolled!' : 'Enroll Now'}
      </button>
      {enrollError && enrolling === classroom.id && (
        <p className="mt-2 text-sm text-red-600">{enrollError}</p>
      )}
    </div>
  </div>
));

export default AvailableClassCard;
