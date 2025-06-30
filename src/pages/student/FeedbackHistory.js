import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/api';

const FeedbackHistory = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
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
    };
    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <h1 className="text-3xl font-bold text-[#200e4a] mb-6">My Feedback & Grading History</h1>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      ) : feedback.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No feedback available.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strengths</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Areas for Improvement</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.teacher_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.rating}/5</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.comment || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.strengths || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.areas_of_improvement || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;
