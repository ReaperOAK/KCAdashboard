import React from 'react';
import { FileText } from 'lucide-react';


const AssignmentCard = React.memo(({ assignment, onViewSubmissions }) => (
  <div
    className="bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark rounded-2xl p-5 sm:p-7 shadow-md hover:shadow-xl hover:scale-[1.015] focus-within:shadow-xl focus-within:scale-[1.01] transition-all duration-200 group  cursor-pointer"
    tabIndex={0}
    role="region"
    aria-label={`Assignment: ${assignment.title}`}
  >
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-accent" aria-hidden="true" />
          <h3 className="text-xl font-medium text-primary dark:text-text-light group-hover:text-accent transition-colors leading-tight">
            {assignment.title}
          </h3>
        </div>
        <p className="text-sm sm:text-base text-gray-dark dark:text-gray-light mb-3 line-clamp-2">
          {assignment.description}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div>
            <span className="font-medium text-gray-dark dark:text-gray-light">Due Date:</span>
            <p className="text-gray-dark dark:text-gray-light">{new Date(assignment.due_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark dark:text-gray-light">Points:</span>
            <p className="text-gray-dark dark:text-gray-light">{assignment.points}</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark dark:text-gray-light">Submissions:</span>
            <p className="text-gray-dark dark:text-gray-light">{assignment.total_submissions}/{assignment.total_students} ({assignment.submission_rate}%)</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark dark:text-gray-light">Graded:</span>
            <p className="text-gray-dark dark:text-gray-light">{assignment.graded_submissions}/{assignment.total_submissions}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto items-end sm:items-start">
        <button
          type="button"
          onClick={onViewSubmissions}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:bg-secondary focus:ring-2 focus:ring-accent focus:outline-none w-full sm:w-auto font-semibold shadow transition-all duration-200"
          aria-label={`View submissions for ${assignment.title}`}
        >
          View Submissions
        </button>
      </div>
    </div>
  </div>
));

export default AssignmentCard;
