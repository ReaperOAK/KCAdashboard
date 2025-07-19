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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" role="dialog" aria-modal="true" aria-label="Upload Practice Position">
      <form onSubmit={onSubmit} className="bg-background-light dark:bg-background-dark border border-gray-light shadow-xl rounded-xl p-6 w-full max-w-md relative transition-all duration-200" aria-labelledby="practice-upload-title">
        <div className="flex justify-between items-center mb-4">
          <h2 id="practice-upload-title" className="text-2xl font-semibold text-primary flex items-center gap-2">
            {/* Lucide icon: Upload */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" /></svg>
            Upload Practice Position
          </h2>
          <button type="button" onClick={onClose} className="text-gray-dark hover:text-primary text-2xl px-2 py-0 bg-transparent rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200" aria-label="Close upload modal">
            {/* Lucide icon: X */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {uploadError && <div className="mb-3 text-error font-medium flex items-center gap-2">
          {/* Lucide icon: AlertCircle */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
          {uploadError}
        </div>}
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary" htmlFor="practice-title">Title</label>
          <input id="practice-title" name="title" value={uploadData.title} onChange={onChange} required className="w-full border border-gray-light rounded px-3 py-2 bg-background-light dark:bg-background-dark text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary" htmlFor="practice-description">Description</label>
          <textarea id="practice-description" name="description" value={uploadData.description} onChange={onChange} rows={2} className="w-full border border-gray-light rounded px-3 py-2 bg-background-light dark:bg-background-dark text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary" htmlFor="practice-type">Type</label>
          <select id="practice-type" name="type" value={uploadData.type} onChange={onChange} className="w-full border border-gray-light rounded px-3 py-2 bg-background-light dark:bg-background-dark text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200">
            <option value="fen">FEN</option>
            <option value="pgn">PGN</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary" htmlFor="practice-position">{uploadData.type === 'fen' ? 'FEN String' : 'PGN Content'}</label>
          <textarea id="practice-position" name="position" value={uploadData.position} onChange={onChange} rows={uploadData.type === 'fen' ? 2 : 6} required className="w-full border border-gray-light rounded px-3 py-2 bg-background-light dark:bg-background-dark text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium text-primary" htmlFor="practice-difficulty">Difficulty</label>
          <select id="practice-difficulty" name="difficulty" value={uploadData.difficulty} onChange={onChange} className="w-full border border-gray-light rounded px-3 py-2 bg-background-light dark:bg-background-dark text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-light rounded text-gray-dark bg-background-light dark:bg-background-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-all duration-200 flex items-center gap-2" disabled={uploading} aria-busy={uploading} aria-label="Upload practice position">
            {uploading ? (
              <>
                {/* Lucide icon: Loader2 (spinner) */}
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Uploading...
              </>
            ) : (
              <>
                {/* Lucide icon: Upload */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" /></svg>
                Upload
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

export default PracticeUploadModal;
