import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/api';

const ReportCard = () => {
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiService.get('/grading/get-student-report-cards.php');
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
    };
    fetchReportCards();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold text-[#200e4a] mb-6">My Report Cards</h1>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      ) : reportCards.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No report cards available.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportCards.map(card => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(card.uploaded_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{card.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a href={card.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View / Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
