
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import UploadUtils from '../../utils/uploadUtils';
// Grading Modal (uses Formik for validation)
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Loading skeleton for assignments
const AssignmentsLoadingSkeleton = React.memo(() => (
  <div className="py-8 flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse bg-background-light border border-gray-light rounded-lg p-6">
        <div className="h-6 w-1/3 bg-gray-light rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-light rounded mb-3" />
        <div className="h-4 w-1/4 bg-gray-light rounded mb-1" />
        <div className="h-4 w-1/4 bg-gray-light rounded mb-1" />
      </div>
    ))}
  </div>
));

// Error alert
const AssignmentsErrorAlert = React.memo(({ error }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded p-4 text-center" role="alert">
    {error}
  </div>
));

// Assignment Card
const AssignmentCard = React.memo(({ assignment, onViewSubmissions }) => (
  <div className="bg-white border border-gray-light rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-secondary mb-2">{assignment.title}</h3>
        <p className="text-gray-dark mb-3">{assignment.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-dark">Due Date:</span>
            <p className="text-gray-dark">{new Date(assignment.due_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark">Points:</span>
            <p className="text-gray-dark">{assignment.points}</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark">Submissions:</span>
            <p className="text-gray-dark">{assignment.total_submissions}/{assignment.total_students} ({assignment.submission_rate}%)</p>
          </div>
          <div>
            <span className="font-medium text-gray-dark">Graded:</span>
            <p className="text-gray-dark">{assignment.graded_submissions}/{assignment.total_submissions}</p>
          </div>
        </div>
      </div>
      <div className="ml-4">
        <button
          type="button"
          onClick={onViewSubmissions}
          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`View submissions for ${assignment.title}`}
        >
          View Submissions
        </button>
      </div>
    </div>
  </div>
));

// Submission Card
const SubmissionCard = React.memo(({ submission, onGrade }) => (
  <div className="bg-white border border-gray-light rounded-lg p-6">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <h3 className="font-medium text-secondary mb-2">{submission.student_name}</h3>
        <p className="text-sm text-gray-dark mb-3">
          Submitted: {new Date(submission.submission_date).toLocaleString()}
        </p>
        {submission.submission_text && (
          <div className="mb-3">
            <span className="font-medium text-gray-dark">Text Submission:</span>
            <div className="mt-1 p-3 bg-background-light rounded border">
              <p className="text-text-dark whitespace-pre-wrap">{submission.submission_text}</p>
            </div>
          </div>
        )}
        {submission.submission_file && (
          <div className="mb-3">
            <span className="font-medium text-gray-dark">File Submission:</span>
            <div className="mt-1">
              <a
                href={UploadUtils.getAssignmentUrl(submission.submission_file)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-accent underline"
              >
                Download File
              </a>
            </div>
          </div>
        )}
        {submission.grade !== null && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-green-800">Grade: {submission.grade}</span>
              <span className="text-sm text-green-600">
                Graded by {submission.graded_by_name} on {new Date(submission.graded_at).toLocaleDateString()}
              </span>
            </div>
            {submission.feedback && (
              <p className="text-green-700 whitespace-pre-wrap">{submission.feedback}</p>
            )}
          </div>
        )}
      </div>
      <div className="ml-4">
        <button
          type="button"
          onClick={onGrade}
          className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            submission.grade !== null
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-secondary text-white hover:bg-accent'
          }`}
          aria-label={submission.grade !== null ? `Update grade for ${submission.student_name}` : `Grade ${submission.student_name}`}
        >
          {submission.grade !== null ? 'Update Grade' : 'Grade'}
        </button>
      </div>
    </div>
  </div>
));

const GradingModal = React.memo(({ open, onClose, onSubmit, initialValues, studentName }) => {
  // Trap focus and close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg" tabIndex={-1}>
        <h2 className="text-2xl font-bold text-primary mb-4">
          Grade Submission - {studentName}
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({
            grade: Yup.number().min(0).max(100).required('Grade is required'),
            feedback: Yup.string().max(1000, 'Feedback too long'),
          })}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-dark">Grade</label>
                <Field
                  id="grade"
                  name="grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                  placeholder="Enter grade (0-100)"
                  aria-required="true"
                />
                <ErrorMessage name="grade" component="div" className="text-red-600 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-dark">Feedback</label>
                <Field
                  as="textarea"
                  id="feedback"
                  name="feedback"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
                  placeholder="Provide feedback for the student..."
                  aria-required="false"
                />
                <ErrorMessage name="feedback" component="div" className="text-red-600 text-xs mt-1" />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-light rounded-md shadow-sm text-sm font-medium text-gray-dark hover:bg-background-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !dirty}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Submit Grade
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});

// Main AssignmentsView
const AssignmentsView = ({ classroomId, refreshTrigger }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getTeacherAssignments(classroomId);
      setAssignments(response.assignments || []);
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments, refreshTrigger]);

  // View submissions for an assignment
  const handleViewSubmissions = useCallback(async (assignment) => {
    try {
      setSelectedAssignment(assignment);
      const response = await ApiService.getAssignmentSubmissions(assignment.id);
      setSubmissions(response.submissions || []);
      setShowSubmissions(true);
    } catch (err) {
      setError('Failed to fetch submissions');
    }
  }, []);

  // Open grading modal for a submission
  const handleGradeSubmission = useCallback((submission) => {
    setGradingSubmission(submission);
  }, []);

  // Submit grade (Formik onSubmit handler)
  const handleSubmitGrade = useCallback(async (values, { setSubmitting, resetForm }) => {
    try {
      await ApiService.gradeAssignment(
        gradingSubmission.id,
        parseFloat(values.grade),
        values.feedback
      );
      // Refresh submissions
      const response = await ApiService.getAssignmentSubmissions(selectedAssignment.id);
      setSubmissions(response.submissions || []);
      setGradingSubmission(null);
      resetForm();
      // Refresh assignments to update graded count
      fetchAssignments();
    } catch (err) {
      setError('Failed to grade assignment');
    } finally {
      setSubmitting(false);
    }
  }, [gradingSubmission, selectedAssignment, fetchAssignments]);

  // Memoized assignment and submission lists
  const assignmentCards = useMemo(() => (
    assignments.length > 0 ? (
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onViewSubmissions={() => handleViewSubmissions(assignment)}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <p className="text-gray-dark text-lg">No assignments created yet.</p>
        <p className="text-gray-light mt-2">Create your first assignment using the "Create Assignment" button.</p>
      </div>
    )
  ), [assignments, handleViewSubmissions]);

  const submissionCards = useMemo(() => (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          onGrade={() => handleGradeSubmission(submission)}
        />
      ))}
    </div>
  ), [submissions, handleGradeSubmission]);

  // Loading and error states
  if (loading) return <AssignmentsLoadingSkeleton />;
  if (error) return <AssignmentsErrorAlert error={error} />;

  return (
    <div>
      {!showSubmissions ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary">Class Assignments</h2>
          </div>
          {assignmentCards}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <button
                type="button"
                onClick={() => setShowSubmissions(false)}
                className="text-secondary hover:text-accent mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Back to Assignments"
              >
                ← Back to Assignments
              </button>
              <h2 className="text-xl font-semibold text-primary">
                Submissions for "{selectedAssignment?.title}"
              </h2>
            </div>
          </div>
          {submissionCards}
        </>
      )}

      {/* Grading Modal */}
      <GradingModal
        open={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        onSubmit={handleSubmitGrade}
        initialValues={{
          grade: gradingSubmission?.grade ?? '',
          feedback: gradingSubmission?.feedback ?? '',
        }}
        studentName={gradingSubmission?.student_name || ''}
      />
    </div>
  );
};

export default React.memo(AssignmentsView);
