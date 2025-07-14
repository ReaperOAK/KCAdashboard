import React from 'react';
import { formatSchedule } from '../../utils/formatSchedule';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { CheckCircle } from 'lucide-react';


const EnrolledClassCard = React.memo(({ classroom }) => (
  <section className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg border border-gray-light dark:border-gray-dark hover:shadow-2xl transition-all duration-200 group flex flex-col h-full  w-full max-w-xl mx-auto">
    <div className="p-5 sm:p-6 flex-1 flex flex-col">
      <h2 className="text-xl md:text-2xl font-bold text-primary dark:text-text-light mb-2 flex items-center gap-2 truncate" title={classroom.name}>
        <CheckCircle className="text-success w-5 h-5" aria-hidden="true" />
        <span>{classroom.name}</span>
      </h2>
      <p className="text-base md:text-lg text-gray-dark dark:text-gray-light mb-4 leading-relaxed break-words whitespace-pre-line">{classroom.description}</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-base">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-secondary">Teacher:</span>
          <span className="text-primary dark:text-text-light font-medium">{classroom.teacher_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-secondary">Schedule:</span>
          <span className="text-primary dark:text-text-light font-medium">{formatSchedule(classroom.schedule)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-secondary">Status:</span>
          <StatusBadge status={classroom.status} />
        </div>
      </div>
    </div>
    <div className="px-5 sm:px-6 py-4 bg-gray-light/40 dark:bg-background-dark border-t border-gray-light dark:border-gray-dark">
      <Link
        to={`/student/classes/${classroom.id}`}
        className="block w-full text-center text-secondary hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent font-semibold text-base transition-all duration-200 py-2 rounded-md bg-white dark:bg-background-dark shadow-sm"
        aria-label={`View details for ${classroom.name}`}
      >
        View Details →
      </Link>
    </div>
  </section>
));

export default EnrolledClassCard;
