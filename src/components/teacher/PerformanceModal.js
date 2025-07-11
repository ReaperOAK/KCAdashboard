import React from 'react';

const PerformanceModal = React.memo(function PerformanceModal({ open, student, performanceData, selectedTimeframe, onTimeframeChange, onClose, formatDate, getRatingColor }) {
  if (!open || !student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Performance: {student.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Time frame selector */}
        <div className="flex space-x-2 mb-6">
          <span className="text-gray-700">Time Period:</span>
          {['week', 'month', 'quarter', 'year'].map(period => (
            <button
              key={period}
              type="button"
              onClick={() => onTimeframeChange(period)}
              className={`px-3 py-1 text-sm rounded-md ${selectedTimeframe === period ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-pressed={selectedTimeframe === period}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        {!performanceData ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Attendance Summary</h3>
              {performanceData.attendance ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-secondary">{performanceData.attendance.present || 0}</div>
                    <div className="text-sm text-gray-500">Present</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-red-500">{performanceData.attendance.absent || 0}</div>
                    <div className="text-sm text-gray-500">Absent</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-yellow-500">{performanceData.attendance.late || 0}</div>
                    <div className="text-sm text-gray-500">Late</div>
                  </div>
                  <div className="bg-white p-3 rounded-md text-center">
                    <div className="text-2xl font-bold text-blue-500">{performanceData.attendance.rate || 0}%</div>
                    <div className="text-sm text-gray-500">Attendance Rate</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No attendance data available</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Quiz Performance Summary</h3>
              {performanceData.quiz_performance ? (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-md">
                    <div className="text-2xl font-bold text-secondary">{performanceData.quiz_performance.average || 0}</div>
                    <div className="text-sm text-gray-500">Average Score</div>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <div className="text-2xl font-bold text-blue-500">{performanceData.quiz_performance.count || 0}</div>
                    <div className="text-sm text-gray-500">Total Quizzes</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No quiz performance data available</p>
              )}
            </div>
            {/* Recent Feedback */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">Recent Teacher Feedback</h3>
              {performanceData.feedback && performanceData.feedback.length > 0 ? (
                <div className="space-y-4">
                  {performanceData.feedback.map((feedback) => (
                    <div key={feedback.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">By {feedback.teacher_name} on {formatDate(feedback.created_at)}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(feedback.rating)}`}>{feedback.rating}/5</span>
                      </div>
                      {feedback.comment && (<div className="mb-2"><h5 className="text-sm font-medium text-gray-700">Comment:</h5><p className="text-sm text-gray-600">{feedback.comment}</p></div>)}
                      {feedback.strengths && (<div className="mb-2"><h5 className="text-sm font-medium text-gray-700">Strengths:</h5><p className="text-sm text-gray-600">{feedback.strengths}</p></div>)}
                      {feedback.areas_of_improvement && (<div><h5 className="text-sm font-medium text-gray-700">Areas for Improvement:</h5><p className="text-sm text-gray-600">{feedback.areas_of_improvement}</p></div>)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent feedback available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PerformanceModal;
