
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
    <section className="mb-6 p-4 bg-background-light  rounded-lg" aria-label="Upload details">
      <h3 className="text-lg font-semibold text-primary mb-4">Upload Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pgn-upload-title" className="block text-sm font-medium text-text-dark  mb-2">Title *</label>
          <input
            id="pgn-upload-title"
            type="text"
            value={uploadTitle}
            onChange={handleTitleChange}
            placeholder="Enter PGN title..."
            className="w-full px-3 py-2 border border-gray-light  rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark "
            required
            aria-required="true"
            aria-label="PGN title"
          />
        </div>
        <div>
          <label htmlFor="pgn-upload-category" className="block text-sm font-medium text-text-dark  mb-2">Category</label>
          <select
            id="pgn-upload-category"
            value={uploadCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-light  rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark "
            aria-label="PGN category"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pgn-upload-description" className="block text-sm font-medium text-text-dark  mb-2">Description</label>
          <textarea
            id="pgn-upload-description"
            value={uploadDescription}
            onChange={handleDescriptionChange}
            placeholder="Optional description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-light  rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark "
            aria-label="PGN description"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={handleIsPublicChange}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:ring-accent  focus:ring-2"
              aria-checked={isPublic}
              aria-label="Make this PGN public (visible to all users)"
            />
            <span className="text-sm font-medium text-text-dark ">Make this PGN public (visible to all users)</span>
          </label>
          <p className="text-xs text-gray-dark  mt-1">
            {isPublic ? 'Anyone can view this PGN' : 'Only you can view this PGN'}
          </p>
        </div>
      </div>
      <div className="md:col-span-2 mt-4">
        <label htmlFor="pgn-visibility" className="block text-sm font-medium text-text-dark mb-2">Visibility</label>
        <select
          id="pgn-visibility"
          value={visibility}
          onChange={handleVisibilityChange}
          className="w-full px-3 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-text-dark"
        >
          <option value="public">Public (all users)</option>
          <option value="private">Private (only you)</option>
          <option value="batch">Batch</option>
          <option value="students">Specific Students</option>
        </select>
        {visibility === 'batch' && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-text-dark mb-1">Select Batch(es)</label>
            <select multiple value={visibilityDetails?.batch_ids || []} onChange={handleBatchChange} className="w-full px-2 py-1 border border-gray-light rounded">
              {batchOptions.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
        )}
        {visibility === 'students' && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-text-dark mb-1">Select Student(s)</label>
            <select multiple value={visibilityDetails?.student_ids || []} onChange={handleStudentChange} className="w-full px-2 py-1 border border-gray-light rounded">
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
