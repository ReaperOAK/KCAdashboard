import React from 'react';

const PGNCard = ({ pgn, viewMode, onView, onShare, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#461fa3] mb-2">
          {pgn.title}
        </h3>
        <p className="text-gray-600 mb-4">{pgn.description}</p>
        <div className="text-sm text-gray-500">
          <p><span className="font-semibold">Category:</span> {pgn.category}</p>
          <p><span className="font-semibold">Created:</span> {new Date(pgn.created_at).toLocaleDateString()}</p>
          <p><span className="font-semibold">Access:</span> {pgn.is_public ? 'Public' : 'Private'}</p>
          {viewMode === 'shared' && (
            <>
              <p><span className="font-semibold">Shared by:</span> {pgn.shared_by}</p>
              <p><span className="font-semibold">Permission:</span> {pgn.permission === 'edit' ? 'Can Edit' : 'View Only'}</p>
            </>
          )}
          {viewMode === 'own' && pgn.share_count > 0 && (
            <p><span className="font-semibold">Shared with:</span> {pgn.share_count} {pgn.share_count === 1 ? 'teacher' : 'teachers'}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
        <button
          onClick={() => onView(pgn)}
          className="text-[#461fa3] hover:text-[#7646eb]"
        >
          View Analysis
        </button>
        <div className="flex space-x-3">
          {viewMode === 'own' && (
            <button
              onClick={() => onShare(pgn)}
              className="text-[#461fa3] hover:text-[#7646eb]"
            >
              Share
            </button>
          )}
          <a 
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn.pgn_content)}`}
            download={`${pgn.title}.pgn`}
            className="text-[#461fa3] hover:text-[#7646eb]"
          >
            Download
          </a>
          {viewMode === 'own' && (
            <button
              onClick={() => onDelete(pgn)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PGNCard;
