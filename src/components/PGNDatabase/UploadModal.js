import React from 'react';

const UploadModal = ({ show, onClose, uploadForm, setUploadForm, handleFileChange, handleSubmit, loading, error }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Upload PGN</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={uploadForm.category}
              onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
            >
              <option value="opening">Opening</option>
              <option value="middlegame">Middlegame</option>
              <option value="endgame">Endgame</option>
              <option value="tactics">Tactics</option>
              <option value="strategy">Strategy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PGN Content</label>
            <textarea
              value={uploadForm.pgn_content}
              onChange={(e) => setUploadForm({...uploadForm, pgn_content: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3] font-mono"
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload PGN File</label>
            <input
              type="file"
              accept=".pgn"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-[#461fa3] file:text-white
                  hover:file:bg-[#7646eb]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              checked={uploadForm.is_public}
              onChange={(e) => setUploadForm({...uploadForm, is_public: e.target.checked})}
              className="rounded border-gray-300 text-[#461fa3] focus:ring-[#461fa3]"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
              Make this PGN public to all students
            </label>
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
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb] disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
