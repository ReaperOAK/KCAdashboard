

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GradingApi } from '../../api/grading';
import LoadingSpinner from '../../components/reportcard/LoadingSpinner';
import ErrorState from '../../components/reportcard/ErrorState';
import ReportCardTable from '../../components/reportcard/ReportCardTable';

// Main component
export const ReportCard = React.memo(() => {
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GradingApi.getStudentReportCards();
      if (response.success) {
        setReportCards(response.report_cards);
      } else {
        setError(response.message || 'Failed to fetch report cards');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch report cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = useMemo(() => {
    if (loading) return <LoadingSpinner label="Loading report cards..." />;
    if (error) return <ErrorState message={error} />;
    if (reportCards.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-12 h-12 text-gray-light mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-gray-dark text-lg">No report cards available.</span>
        </div>
      );
    }
    return <ReportCardTable reportCards={reportCards} />;
  }, [loading, error, reportCards]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-2 sm:px-4 md:px-8 py-8 transition-all duration-200">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 md:mb-8 text-center">My Report Cards</h1>
      <div className="max-w-4xl mx-auto w-full">
        {content}
      </div>
    </div>
  );
});

export default ReportCard;
