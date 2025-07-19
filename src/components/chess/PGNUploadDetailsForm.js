
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
  visibility,
  setVisibility,
  visibilityDetails,
  setVisibilityDetails,
  isPublic,
  setIsPublic,
  batchOptions = [],
  studentOptions = [],
}) {
  const handleTitleChange = useCallback((e) => setUploadTitle(e.target.value), [setUploadTitle]);
  const handleCategoryChange = useCallback((e) => setUploadCategory(e.target.value), [setUploadCategory]);
  const handleDescriptionChange = useCallback((e) => setUploadDescription(e.target.value), [setUploadDescription]);
  const handleIsPublicChange = useCallback((e) => setIsPublic(e.target.checked), [setIsPublic]);
  const handleVisibilityChange = useCallback((e) => setVisibility(e.target.value), [setVisibility]);
  const handleBatchChange = useCallback((e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setVisibilityDetails({ ...visibilityDetails, batch_ids: selected });
  }, [setVisibilityDetails, visibilityDetails]);
  const handleStudentChange = useCallback((e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setVisibilityDetails({ ...visibilityDetails, student_ids: selected });
  }, [setVisibilityDetails, visibilityDetails]);

  return (
    <section
      className="mb-6 p-4 bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl"
      aria-label="Upload details"
    >
      <h3 className="text-xl md:text-2xl font-semibold text-primary mb-6">Upload Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="pgn-upload-title" className="block text-sm font-medium text-text-dark mb-2">Title *</label>
          <input
            id="pgn-upload-title"
            type="text"
            value={uploadTitle}
            onChange={handleTitleChange}
            placeholder="Enter PGN title..."
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-transparent bg-white text-text-dark transition-all duration-200"
            required
            aria-required="true"
            aria-label="PGN title"
          />
        </div>
        <div>
          <label htmlFor="pgn-upload-category" className="block text-sm font-medium text-text-dark mb-2">Category</label>
          <select
            id="pgn-upload-category"
            value={uploadCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-transparent bg-white text-text-dark transition-all duration-200"
            aria-label="PGN category"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pgn-upload-description" className="block text-sm font-medium text-text-dark mb-2">Description</label>
          <textarea
            id="pgn-upload-description"
            value={uploadDescription}
            onChange={handleDescriptionChange}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-transparent bg-white text-text-dark transition-all duration-200"
            aria-label="PGN description"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-2 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={handleIsPublicChange}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-checked={isPublic}
              aria-label="Make this PGN public (visible to all users)"
            />
            <span className="text-sm font-medium text-text-dark">Make this PGN public (visible to all users)</span>
          </label>
          <p className="text-xs text-gray-dark mt-1" id="public-desc">
            {isPublic ? 'Anyone can view this PGN' : 'Only you can view this PGN'}
          </p>
        </div>
      </div>
      <div className="md:col-span-2 mt-6">
        <label htmlFor="pgn-visibility" className="block text-sm font-medium text-text-dark mb-2">Visibility</label>
        <select
          id="pgn-visibility"
          value={visibility}
          onChange={handleVisibilityChange}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:border-transparent bg-white text-text-dark transition-all duration-200"
          aria-describedby="visibility-desc"
        >
          <option value="public">Public (all users)</option>
          <option value="private">Private (only you)</option>
          <option value="batch">Batch</option>
          <option value="students">Specific Students</option>
        </select>
        <p className="text-xs text-gray-dark mt-1" id="visibility-desc">
          Choose who can view this PGN after upload.
        </p>
        {visibility === 'batch' && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-text-dark mb-1 flex items-center gap-1">
              {/* Lucide icon: Users */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Select Batch(es)
            </label>
            <select multiple value={visibilityDetails?.batch_ids || []} onChange={handleBatchChange} className="w-full px-2 py-1 border border-gray-light rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200">
              {batchOptions.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
        )}
        {visibility === 'students' && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-text-dark mb-1 flex items-center gap-1">
              {/* Lucide icon: User */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 0112 15a4 4 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Select Student(s)
            </label>
            <select multiple value={visibilityDetails?.student_ids || []} onChange={handleStudentChange} className="w-full px-2 py-1 border border-gray-light rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200">
              {studentOptions.map(stu => (
                <option key={stu.id} value={stu.id}>{stu.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </section>
  );
});

export default PGNUploadDetailsForm;
