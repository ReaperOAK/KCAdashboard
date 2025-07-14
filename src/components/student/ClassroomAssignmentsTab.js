
import React from 'react';
import UploadUtils from '../../utils/uploadUtils';

// AssignmentCard: Pure, focused, beautiful, responsive
const AssignmentCard = React.memo(function AssignmentCard({ assignment, handleFileChange, submissionText, setSubmissionText, handleSubmitAssignment, submitting, submitError, submitSuccess }) {
  const now = new Date();
  const due = new Date(assignment.due_date);
  const isOverdue = due < now && assignment.status === 'pending';
  const statusColor = assignment.status === 'graded'
    ? 'bg-green-100 text-green-800'
    : assignment.status === 'submitted'
    ? 'bg-blue-100 text-blue-800'
    : isOverdue
    ? 'bg-red-100 text-red-800'
    : 'bg-gray-light text-gray-dark';

  return (
    <div className="border border-gray-light rounded-xl shadow-md overflow-hidden bg-background-light dark:bg-background-dark transition-all duration-200">
      <div className={["p-4 flex flex-col gap-2",
        assignment.status === 'graded' ? 'bg-green-50' :
        assignment.status === 'submitted' ? 'bg-blue-50' :
        isOverdue ? 'bg-red-50' : 'bg-white'
      ].join(' ')}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-semibold text-secondary text-lg mb-1">{assignment.title}</h3>
            <p className="text-sm text-gray-dark mb-1">{assignment.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-dark">
              <span>Due: <span className="font-medium">{due.toLocaleDateString()}</span></span>
              <span className={["px-2 py-1 rounded-full font-semibold", statusColor].join(' ')}>
                {assignment.status === 'graded' ? 'Graded' :
                  assignment.status === 'submitted' ? 'Submitted' :
                  isOverdue ? 'Overdue' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Graded Assignment */}
      {assignment.status === 'graded' && (
        <div className="p-4 border-t border-gray-light bg-white ">
          <h4 className="font-medium text-sm mb-2 text-green-800">Feedback & Grading</h4>
          <p className="text-sm text-gray-dark mb-2">{assignment.feedback || 'No written feedback provided.'}</p>
          <p className="font-semibold text-green-700">Grade: {assignment.grade}</p>
        </div>
      )}
      {/* Pending Assignment Submission */}
      {assignment.status === 'pending' && due >= now && (
        <div className="p-4 border-t border-gray-light ">
          <h4 className="font-medium text-sm mb-2 text-primary">Submit Your Work</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-dark mb-1">Upload File <span className="text-gray-light">(optional)</span></label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-dark file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Upload assignment file (optional)"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-dark mb-1">Text Submission <span className="text-gray-light">(optional)</span></label>
              <textarea
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-light shadow-sm focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-50 px-3 py-2 bg-white dark:bg-background-dark text-text-dark"
                rows={4}
                placeholder="Type your answer here..."
                maxLength={500}
              />
              <div className="text-xs text-gray-dark text-right">{submissionText.length}/500</div>
            </div>
            {submitError && (
              <div className="bg-error text-white rounded-md px-3 py-2 text-sm border border-error " role="alert">{submitError}</div>
            )}
            {submitSuccess && (
              <div className="bg-success text-white rounded-md px-3 py-2 text-sm border border-success ">Assignment submitted successfully!</div>
            )}
            <button
              onClick={() => handleSubmitAssignment(assignment.id)}
              disabled={submitting}
              className={[
                'w-full py-2 rounded-md font-semibold transition-all duration-200',
                'bg-secondary text-white hover:bg-accent',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                submitting ? 'bg-gray-dark text-gray-light cursor-not-allowed opacity-60' : '',
              ].join(' ')}
              aria-label="Submit assignment"
              tabIndex={0}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Submitting...
                </span>
              ) : 'Submit Assignment'}
            </button>
          </div>
        </div>
      )}
      {/* Submitted Assignment */}
      {assignment.status === 'submitted' && (
        <div className="p-4 border-t border-gray-light bg-blue-50 ">
          <h4 className="font-medium text-sm mb-2 text-blue-800">Assignment Submitted</h4>
          <p className="text-sm text-blue-600 mb-2">
            Submitted on: {new Date(assignment.submission_date).toLocaleString()}
          </p>
          {assignment.submission_text && (
            <div className="mb-2">
              <span className="font-medium text-blue-700">Your Text Submission:</span>
              <div className="mt-1 p-2 bg-white rounded border">
                <p className="text-sm text-gray-dark whitespace-pre-wrap">{assignment.submission_text}</p>
              </div>
            </div>
          )}
          {assignment.submission_file && (
            <div>
              <span className="font-medium text-blue-700">Your File Submission:</span>
              <div className="mt-1">
                <a
                  href={UploadUtils.getAssignmentUrl(assignment.submission_file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View Submitted File
                </a>
              </div>
            </div>
          )}
          <p className="text-sm text-blue-600 mt-2">Waiting for teacher to grade...</p>
        </div>
      )}
      {/* Graded Assignment (detailed) */}
      {assignment.status === 'graded' && (
        <div className="p-4 border-t border-gray-light bg-green-50 ">
          <h4 className="font-medium text-sm mb-2 text-green-800">Assignment Graded</h4>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
            <span className="font-medium text-green-700">Grade: {assignment.grade}</span>
            <span className="text-sm text-green-600">
              Submitted: {new Date(assignment.submission_date).toLocaleDateString()}
            </span>
          </div>
          {assignment.feedback && (
            <div className="mb-3">
              <span className="font-medium text-green-700">Teacher Feedback:</span>
              <div className="mt-1 p-3 bg-white rounded border">
                <p className="text-sm text-gray-dark whitespace-pre-wrap">{assignment.feedback}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AssignmentCard.displayName = 'AssignmentCard';

const ClassroomAssignmentsTab = React.memo(function ClassroomAssignmentsTab({
  assignments,
  handleFileChange,
  submissionText,
  setSubmissionText,
  handleSubmitAssignment,
  submitting,
  submitError,
  submitSuccess,
  submissionFile
}) {
  return (
    <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 md:px-6 lg:px-0 ">
      <h2 className="text-2xl text-text-dark font-semibold mb-6">Assignments</h2>
      {assignments.length > 0 ? (
        <div className="flex flex-col gap-8">
          {assignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              handleFileChange={handleFileChange}
              submissionText={submissionText}
              setSubmissionText={setSubmissionText}
              handleSubmitAssignment={handleSubmitAssignment}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={submitSuccess}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-background-light rounded-xl shadow-inner border border-gray-light ">
          <svg className="h-12 w-12 text-gray-light mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a2 2 0 10-4 0v1H9a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <p className="text-gray-dark text-lg">No assignments have been given for this class yet.</p>
        </div>
      )}
    </section>
  );
});

ClassroomAssignmentsTab.displayName = 'ClassroomAssignmentsTab';

export default ClassroomAssignmentsTab;
