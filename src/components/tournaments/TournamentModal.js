
import React, { useRef, useEffect } from 'react';

/**
 * TournamentModal: Beautiful, accessible, responsive modal for tournament creation/editing.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const TournamentModal = React.memo(function TournamentModal({ open, onClose, onSubmit, formData, onInputChange, editingTournament, className = '' }) {
  const modalRef = useRef(null);
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={["bg-background-light rounded-2xl border border-gray-light shadow-2xl p-4 sm:p-8 w-full max-w-2xl relative z-10 ", className].join(' ')}
        tabIndex={-1}
        ref={modalRef}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1.5 transition-colors"
          aria-label="Close tournament modal"
        >
          {/* Close icon (SVG, no external dep) */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary text-center">
          {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
        </h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="date_time">Date & Time</label>
              <input
                id="date_time"
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                placeholder="Leave empty for online tournaments"
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="entry_fee">Entry Fee (₹)</label>
              <input
                id="entry_fee"
                type="number"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="prize_pool">Prize Pool (₹)</label>
              <input
                id="prize_pool"
                type="number"
                name="prize_pool"
                value={formData.prize_pool}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="max_participants">Max Participants</label>
              <input
                id="max_participants"
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                min="0"
              />
              <p className="text-xs text-gray-dark mt-1">Set to 0 for unlimited participants</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="lichess_id">Lichess Tournament ID</label>
              <input
                id="lichess_id"
                type="text"
                name="lichess_id"
                value={formData.lichess_id}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark bg-white focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="For online tournaments only"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-accent rounded-md text-accent hover:bg-accent hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent font-semibold shadow-md"
            >
              {editingTournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default TournamentModal;
