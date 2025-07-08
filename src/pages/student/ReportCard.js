
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GradingApi } from '../../api/grading';

// Spinner for loading state
const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
    <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full mb-4" />
    <span className="text-gray-dark">Loading report cards...</span>
  </div>
));

// Error state
const ErrorState = React.memo(({ message }) => (
  <div className="bg-red-50 text-red-700 border border-red-200 rounded p-4 text-center mb-6" role="alert">
    <span>{message}</span>
  </div>
));

// Table for report cards
const ReportCardTable = React.memo(({ reportCards }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-light text-sm" aria-label="Report Cards Table">
      <thead className="bg-gray-light">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Uploaded At</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">Description</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-dark uppercase tracking-wider">File</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-light">
        {reportCards.map(card => (
          <tr key={card.id}>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{new Date(card.uploaded_at).toLocaleString()}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{card.description || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={`View or download report card: ${card.description || 'file'}`}
              >
                View / Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

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
  }, [fetchReportCards]);

  const content = useMemo(() => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorState message={error} />;
    if (reportCards.length === 0) {
      return <div className="text-gray-dark text-center py-8">No report cards available.</div>;
    }
    return <ReportCardTable reportCards={reportCards} />;
  }, [loading, error, reportCards]);

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 md:mb-8">My Report Cards</h1>
      {content}
    </div>
  );
});

export default ReportCard;
