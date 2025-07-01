
import React, { useCallback } from 'react';

const categories = [
  { value: 'opening', label: 'Opening' },
  { value: 'middlegame', label: 'Middlegame' },
  { value: 'endgame', label: 'Endgame' },
  { value: 'tactics', label: 'Tactics' },
  { value: 'strategy', label: 'Strategy' },
];

export const PGNUploadDetailsForm = React.memo(function PGNUploadDetailsForm({
  uploadTitle,
  setUploadTitle,
  uploadCategory,
  setUploadCategory,
  uploadDescription,
  setUploadDescription,
  isPublic,
  setIsPublic,
}) {
  const handleTitleChange = useCallback((e) => setUploadTitle(e.target.value), [setUploadTitle]);
  const handleCategoryChange = useCallback((e) => setUploadCategory(e.target.value), [setUploadCategory]);
  const handleDescriptionChange = useCallback((e) => setUploadDescription(e.target.value), [setUploadDescription]);
  const handleIsPublicChange = useCallback((e) => setIsPublic(e.target.checked), [setIsPublic]);

  return (
    <section className="mb-6 p-4 bg-background-light dark:bg-background-dark rounded-lg" aria-label="Upload details">
      <h3 className="text-lg font-semibold text-primary mb-4">Upload Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pgn-upload-title" className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">Title *</label>
          <input
            id="pgn-upload-title"
            type="text"
            value={uploadTitle}
            onChange={handleTitleChange}
            placeholder="Enter PGN title..."
            className="w-full px-3 py-2 border border-gray-light dark:border-gray-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
            required
            aria-required="true"
            aria-label="PGN title"
          />
        </div>
        <div>
          <label htmlFor="pgn-upload-category" className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">Category</label>
          <select
            id="pgn-upload-category"
            value={uploadCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-light dark:border-gray-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
            aria-label="PGN category"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pgn-upload-description" className="block text-sm font-medium text-text-dark dark:text-text-light mb-2">Description</label>
          <textarea
            id="pgn-upload-description"
            value={uploadDescription}
            onChange={handleDescriptionChange}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-light dark:border-gray-dark rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
            aria-label="PGN description"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={handleIsPublicChange}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:ring-accent dark:focus:ring-accent dark:ring-offset-background-dark focus:ring-2 dark:bg-gray-dark dark:border-gray-dark"
              aria-checked={isPublic}
              aria-label="Make this PGN public (visible to all users)"
            />
            <span className="text-sm font-medium text-text-dark dark:text-text-light">Make this PGN public (visible to all users)</span>
          </label>
          <p className="text-xs text-gray-dark dark:text-gray-light mt-1">
            {isPublic ? 'Anyone can view this PGN' : 'Only you can view this PGN'}
          </p>
        </div>
      </div>
    </section>
  );
});

export default PGNUploadDetailsForm;
