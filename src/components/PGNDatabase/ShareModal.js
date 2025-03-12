import React from 'react';

const ShareModal = ({ 
  show, 
  onClose, 
  pgn, 
  teacherList, 
  selectedTeachers,
  toggleTeacherSelection,
  sharePermission, 
  setSharePermission,
  handleSubmit,
  error
}) => {
  if (!show || !pgn) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#200e4a]">Share "{pgn.title}"</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Permission</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  checked={sharePermission === 'view'} 
                  onChange={() => setSharePermission('view')} 
                  className="form-radio text-[#461fa3]"
                />
                <span className="ml-2">View only</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  checked={sharePermission === 'edit'} 
                  onChange={() => setSharePermission('edit')} 
                  className="form-radio text-[#461fa3]"
                />
                <span className="ml-2">Can edit</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teachers ({teacherList.length})
            </label>
            <div className="border rounded-md max-h-60 overflow-y-auto p-1">
              {teacherList.length === 0 && (
                <div className="p-3 text-gray-500 text-center">No other teachers found</div>
              )}
              {teacherList.map((teacher) => (
                <div key={teacher.id} className="flex items-center p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`teacher-${teacher.id}`}
                    checked={selectedTeachers.includes(teacher.id)}
                    onChange={() => toggleTeacherSelection(teacher.id)}
                    className="h-4 w-4 text-[#461fa3] rounded"
                  />
                  <label htmlFor={`teacher-${teacher.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {teacher.full_name} <span className="text-xs text-gray-500">({teacher.email})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedTeachers.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb] disabled:opacity-50"
            >
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
