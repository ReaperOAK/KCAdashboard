import React from 'react';
import UploadUtils from '../../../utils/uploadUtils';
import { User, FileDown, CheckCircle2, Pencil } from 'lucide-react';


const SubmissionCard = React.memo(({ submission, onGrade }) => (
  <div className="bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark rounded-2xl p-6 sm:p-8 shadow-md ">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-secondary" aria-hidden="true" />
          <h3 className="font-medium text-primary dark:text-text-light text-base md:text-lg">{submission.student_name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-dark dark:text-gray-light mb-3">
          Submitted: {new Date(submission.submission_date).toLocaleString()}
        </p>
        {submission.submission_text && (
          <div className="mb-3">
            <span className="font-medium text-gray-dark dark:text-gray-light">Text Submission:</span>
            <div className="mt-1 p-3 bg-background-light dark:bg-background-dark rounded border border-gray-light dark:border-gray-dark">
              <p className="text-text-dark dark:text-text-light whitespace-pre-wrap">{submission.submission_text}</p>
            </div>
          </div>
        )}
        {submission.submission_file && (
          <div className="mb-3">
            <span className="font-medium text-gray-dark dark:text-gray-light">File Submission:</span>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={UploadUtils.getAssignmentUrl(submission.submission_file)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent underline flex items-center gap-1"
              >
                <FileDown className="w-4 h-4" /> Download File
              </a>
            </div>
          </div>
        )}
        {submission.grade !== null && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-1 sm:gap-0">
              <span className="font-medium text-green-800 dark:text-green-300 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Grade: {submission.grade}</span>
              <span className="text-xs text-green-600 dark:text-green-200">
                Graded by {submission.graded_by_name} on {new Date(submission.graded_at).toLocaleDateString()}
              </span>
            </div>
            {submission.feedback && (
              <p className="text-green-700 dark:text-green-200 whitespace-pre-wrap text-xs">{submission.feedback}</p>
            )}
          </div>
        )}
      </div>
      <div className="md:ml-4 flex items-start">
        <button
          type="button"
          onClick={onGrade}
          className={`px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent font-semibold shadow flex items-center gap-2 ${
            submission.grade !== null
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-primary text-white hover:bg-secondary focus:bg-secondary'
          }`}
          aria-label={submission.grade !== null ? `Update grade for ${submission.student_name}` : `Grade ${submission.student_name}`}
        >
          <Pencil className="w-4 h-4" />
          {submission.grade !== null ? 'Update Grade' : 'Grade'}
        </button>
      </div>
    </div>
  </div>
));

export default SubmissionCard;
