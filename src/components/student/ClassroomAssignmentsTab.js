import React from 'react';
import UploadUtils from '../../utils/uploadUtils';

const ClassroomAssignmentsTab = React.memo(({
  assignments,
  handleFileChange,
  submissionText,
  setSubmissionText,
  handleSubmitAssignment,
  submitting,
  submitError,
  submitSuccess,
  submissionFile
}) => (
  <section>
    <h2 className="text-xl font-semibold text-primary mb-4">Assignments</h2>
    {assignments.length > 0 ? (
      <div className="space-y-6">
        {assignments.map(assignment => (
          <div
            key={assignment.id}
            className="border border-gray-light rounded-lg overflow-hidden"
          >
            <div className={`p-4 ${
              assignment.status === 'graded' ? 'bg-green-50' :
              assignment.status === 'submitted' ? 'bg-blue-50' :
              new Date(assignment.due_date) < new Date() ? 'bg-red-50' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-secondary">{assignment.title}</h3>
                  <p className="text-sm text-gray-dark mt-1">{assignment.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-dark">
                    <span className="mr-3">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      new Date(assignment.due_date) < new Date() ? 'bg-red-100 text-red-800' :
                      'bg-gray-light text-gray-dark'
                    }`}>
                      {assignment.status === 'graded' ? 'Graded' :
                        assignment.status === 'submitted' ? 'Submitted' :
                        new Date(assignment.due_date) < new Date() ? 'Overdue' :
                        'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Graded Assignment */}
            {assignment.status === 'graded' && (
              <div className="p-4 border-t border-gray-light bg-white">
                <h4 className="font-medium text-sm mb-2">Feedback & Grading</h4>
                <p className="text-sm text-gray-dark mb-2">{assignment.feedback || 'No written feedback provided.'}</p>
                <p className="font-semibold">Grade: {assignment.grade}</p>
              </div>
            )}
            {/* Pending Assignment Submission */}
            {assignment.status === 'pending' && new Date(assignment.due_date) >= new Date() && (
              <div className="p-4 border-t border-gray-light">
                <h4 className="font-medium text-sm mb-2">Submit Your Work</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-dark">Upload File (optional)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-dark file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-label="Upload assignment file (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-dark">Text Submission (optional)</label>
                    <textarea
                      value={submissionText}
                      onChange={e => setSubmissionText(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                      rows={4}
                      placeholder="Type your answer here..."
                    />
                  </div>
                  {submitError && (
                    <div className="text-sm text-red-600">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="text-sm text-green-600">Assignment submitted successfully!</div>
                  )}
                  <button
                    onClick={() => handleSubmitAssignment(assignment.id)}
                    disabled={submitting}
                    className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    aria-label="Submit assignment"
                    tabIndex={0}
                  >
                    {submitting ? 'Submitting...' : 'Submit Assignment'}
                  </button>
                </div>
              </div>
            )}
            {/* Submitted Assignment */}
            {assignment.status === 'submitted' && (
              <div className="p-4 border-t border-gray-light bg-blue-50">
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
              <div className="p-4 border-t border-gray-light bg-green-50">
                <h4 className="font-medium text-sm mb-2 text-green-800">Assignment Graded</h4>
                <div className="flex justify-between items-center mb-2">
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
        ))}
      </div>
    ) : (
      <p>No assignments have been given for this class yet.</p>
    )}
  </section>
));

export default ClassroomAssignmentsTab;
