import React from 'react';

const FeedbackHistoryModal = React.memo(function FeedbackHistoryModal({ open, student, feedbackHistory, onClose, formatDate, getRatingColor }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Feedback History for {student.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {feedbackHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No feedback history available</p>
        ) : (
          <div className="space-y-6">
            {feedbackHistory.map((feedback) => (
              <div key={feedback.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">{formatDate(feedback.created_at)}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                </div>
                {feedback.comment && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">General Feedback:</h4><p className="text-sm text-gray-600">{feedback.comment}</p></div>)}
                {feedback.strengths && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">Strengths:</h4><p className="text-sm text-gray-600">{feedback.strengths}</p></div>)}
                {feedback.areas_of_improvement && (<div className="mb-3"><h4 className="text-sm font-medium text-gray-700">Areas for Improvement:</h4><p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p></div>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default FeedbackHistoryModal;
