import React from 'react';

const PracticeUploadModal = React.memo(function PracticeUploadModal({
  show,
  uploadData,
  uploading,
  uploadError,
  onChange,
  onClose,
  onSubmit
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={onSubmit} className="bg-background-light rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4 text-primary">Upload Practice Position</h2>
        {uploadError && <div className="mb-3 text-error">{uploadError}</div>}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary">Title</label>
          <input name="title" value={uploadData.title} onChange={onChange} required className="w-full border border-gray-light rounded px-2 py-1 bg-background-light text-text-dark" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary">Description</label>
          <textarea name="description" value={uploadData.description} onChange={onChange} rows={2} className="w-full border border-gray-light rounded px-2 py-1 bg-background-light text-text-dark" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary">Type</label>
          <select name="type" value={uploadData.type} onChange={onChange} className="w-full border border-gray-light rounded px-2 py-1 bg-background-light text-text-dark">
            <option value="fen">FEN</option>
            <option value="pgn">PGN</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary">{uploadData.type === 'fen' ? 'FEN String' : 'PGN Content'}</label>
          <textarea name="position" value={uploadData.position} onChange={onChange} rows={uploadData.type === 'fen' ? 2 : 6} required className="w-full border border-gray-light rounded px-2 py-1 bg-background-light text-text-dark" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary">Difficulty</label>
          <select name="difficulty" value={uploadData.difficulty} onChange={onChange} className="w-full border border-gray-light rounded px-2 py-1 bg-background-light text-text-dark">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-light rounded text-gray-dark bg-background-light">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>
    </div>
  );
});

export default PracticeUploadModal;
