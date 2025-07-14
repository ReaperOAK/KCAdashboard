

import React, { useState, useEffect, useCallback } from 'react';
import { ClassroomApi } from '../../api/classroom';
import AssignmentsLoadingSkeleton from './assignments/AssignmentsLoadingSkeleton';
import AssignmentsErrorAlert from './assignments/AssignmentsErrorAlert';
import GradingModal from './assignments/GradingModal';
import AssignmentsList from './assignments/AssignmentsList';
import SubmissionsList from './assignments/SubmissionsList';

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
      const response = await ClassroomApi.getTeacherAssignments(classroomId);
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
      const response = await ClassroomApi.getAssignmentSubmissions(assignment.id);
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
      await ClassroomApi.gradeAssignment(
        gradingSubmission.id,
        parseFloat(values.grade),
        values.feedback
      );
      // Refresh submissions
      const response = await ClassroomApi.getAssignmentSubmissions(selectedAssignment.id);
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

  // Loading and error states
  if (loading) return <AssignmentsLoadingSkeleton />;
  if (error) return (
    <div aria-live="polite" role="status">
      <AssignmentsErrorAlert error={error} />
    </div>
  );

  return (
    <section className="animate-fade-in w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4 md:p-6">
        {!showSubmissions ? (
          <>
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2 border-b border-gray-light pb-3">
              <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">Class Assignments</h2>
              {/* Optionally add a Create Assignment button here */}
            </header>
            <AssignmentsList assignments={assignments} onViewSubmissions={handleViewSubmissions} />
          </>
        ) : (
          <>
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2 border-b border-gray-light pb-3 w-full">
              <div className="flex flex-col gap-1 w-full">
                <button
                  type="button"
                  onClick={() => setShowSubmissions(false)}
                  className="text-secondary hover:text-accent mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent font-medium text-sm flex items-center gap-1 w-max transition-all duration-200"
                  aria-label="Back to Assignments"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back to Assignments
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                  Submissions for "{selectedAssignment?.title}"
                </h2>
              </div>
            </header>
            <SubmissionsList submissions={submissions} onGrade={handleGradeSubmission} />
          </>
        )}
      </div>

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
    </section>
  );
};

export default React.memo(AssignmentsView);
