
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';

// Spinner for loading state
const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
    <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full mb-4" />
    <span className="text-gray-dark">Loading feedback...</span>
  </div>
));

// Error state
const ErrorState = React.memo(({ message }) => (
  <div className="bg-red-50 text-red-700 border border-red-200 rounded p-4 text-center mb-6" role="alert">
    <span>{message}</span>
  </div>
));

// Table for feedback
const FeedbackTable = React.memo(({ feedback }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-light text-sm" aria-label="Feedback Table">
      <thead className="bg-gray-light">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Date</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Teacher</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Rating</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Comment</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Strengths</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Areas for Improvement</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-light">
        {feedback.map(item => (
          <tr key={item.id}>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{new Date(item.created_at).toLocaleString()}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.teacher_name}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.rating}/5</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.comment || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.strengths || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.areas_of_improvement || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// Main component
export const FeedbackHistory = React.memo(() => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.get('/grading/get-student-feedback-history.php');
      if (response.success) {
        setFeedback(response.feedback);
      } else {
        setError(response.message || 'Failed to fetch feedback');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const content = useMemo(() => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;
    if (feedback.length === 0) {
      return <div className="text-gray-dark text-center py-8">No feedback available.</div>;
    }
    return <FeedbackTable feedback={feedback} />;
  }, [loading, error, feedback]);

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 md:mb-8">My Feedback & Grading History</h1>
      {content}
    </div>
  );
});

export default FeedbackHistory;
