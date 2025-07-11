import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CheckCircle } from 'lucide-react';

const EnrolledClassCard = React.memo(({ classroom }) => (
  <div className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg border border-gray-light hover:shadow-xl transition-all duration-200 group flex flex-col h-full">
    <div className="p-6 flex-1">
      <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
        <CheckCircle className="text-success w-5 h-5" aria-hidden="true" />
        {classroom.name}
      </h2>
      <p className="text-gray-dark mb-4">{classroom.description}</p>
      <div className="text-sm text-gray-dark space-y-1">
        <p><span className="font-semibold">Teacher:</span> {classroom.teacher_name}</p>
        <p><span className="font-semibold">Schedule:</span> {classroom.schedule}</p>
        <p><span className="font-semibold">Status:</span> <StatusBadge status={classroom.status} /></p>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-light/30 border-t">
      <Link
        to={`/student/classes/${classroom.id}`}
        className="block w-full text-center text-secondary hover:text-accent focus:outline-none focus:underline font-medium transition-colors"
        aria-label={`View details for ${classroom.name}`}
      >
        View Details →
      </Link>
    </div>
  </div>
));

export default EnrolledClassCard;
