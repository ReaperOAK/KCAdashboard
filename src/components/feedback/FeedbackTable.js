import React from 'react';

const FeedbackTable = React.memo(({ feedback }) => (
  <div className="bg-background-light dark:bg-background-dark rounded-2xl shadow-lg p-4 sm:p-6 overflow-x-auto border border-gray-light">
    <table className="min-w-full divide-y divide-gray-light text-sm" aria-label="Feedback Table">
      <thead className="bg-gray-light">
        <tr>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Date</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Teacher</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Rating</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Comment</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Strengths</th>
          <th className="px-4 sm:px-6 py-3 text-left text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">Areas for Improvement</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-light">
        {feedback.map(item => (
          <tr key={item.id} className="hover:bg-gray-light/40 transition-colors">
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{new Date(item.created_at).toLocaleString()}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.teacher_name}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark font-semibold">{item.rating}/5</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.comment || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.strengths || '-'}</td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">{item.areas_of_improvement || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

export default FeedbackTable;
