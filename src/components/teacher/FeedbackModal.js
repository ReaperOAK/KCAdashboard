import React from 'react';

const FeedbackModal = React.memo(function FeedbackModal({ open, student, feedback, setFeedback, onClose, onSubmit }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-primary mb-4">Feedback for {student.name}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center space-x-1 mt-1">
              {[1,2,3,4,5].map(num => (
                <span key={num} style={{ cursor: 'pointer', color: feedback.rating >= num ? '#f5b301' : '#ccc', fontSize: 28 }} onClick={() => setFeedback(f => ({ ...f, rating: num }))}>★</span>
              ))}
              <span className="ml-2 text-sm text-gray-500">{feedback.rating}/5</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">General Feedback</label>
            <textarea value={feedback.comment} onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Areas of Improvement</label>
            <textarea value={feedback.areas_of_improvement} onChange={e => setFeedback(f => ({ ...f, areas_of_improvement: e.target.value }))} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Strengths</label>
            <textarea value={feedback.strengths} onChange={e => setFeedback(f => ({ ...f, strengths: e.target.value }))} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent">Submit Feedback</button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default FeedbackModal;
