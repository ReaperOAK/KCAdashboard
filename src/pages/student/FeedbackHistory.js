

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
      return <div className="text-gray-dark text-center py-8 text-lg">No feedback available.</div>;
    }
    return <FeedbackTable feedback={feedback} />;
  }, [loading, error, feedback]);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 md:mb-8 tracking-tight">My Feedback & Grading History</h1>
      {content}
    </div>
  );
});

export default FeedbackHistory;
