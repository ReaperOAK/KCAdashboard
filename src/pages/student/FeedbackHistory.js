

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GradingApi } from '../../api/grading';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import ErrorState from '../../components/feedback/ErrorState';
import FeedbackTable from '../../components/feedback/FeedbackTable';

// Main component
export const FeedbackHistory = React.memo(() => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GradingApi.getFeedbackHistory();
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
      return (
        <div className="bg-white/95 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center mx-auto max-w-2xl">
          <span className="text-3xl mb-2" role="img" aria-label="No feedback">📝</span>
          <div className="text-gray-dark text-lg font-medium">No feedback available.</div>
        </div>
      );
    }
    return <FeedbackTable feedback={feedback} />;
  }, [loading, error, feedback]);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 md:mb-8 tracking-tight text-center">My Feedback & Grading History</h1>
        {content}
      </div>
    </div>
  );
});

export default FeedbackHistory;
