import React from 'react';

const TournamentModal = React.memo(({ open, onClose, onSubmit, formData, onInputChange, editingTournament }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="bg-background-light rounded-xl border border-gray-light shadow-md p-4 sm:p-6 w-full max-w-2xl relative z-10">
        <h2 className="text-xl font-bold mb-4 text-primary">{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                required
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="date_time">Date & Time</label>
              <input
                id="date_time"
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                placeholder="Leave empty for online tournaments"
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                required
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="entry_fee">Entry Fee (₹)</label>
              <input
                id="entry_fee"
                type="number"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="prize_pool">Prize Pool (₹)</label>
              <input
                id="prize_pool"
                type="number"
                name="prize_pool"
                value={formData.prize_pool}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="max_participants">Max Participants</label>
              <input
                id="max_participants"
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                min="0"
              />
              <p className="text-xs text-gray-dark mt-1">Set to 0 for unlimited participants</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-dark mb-1" htmlFor="lichess_id">Lichess Tournament ID</label>
              <input
                id="lichess_id"
                type="text"
                name="lichess_id"
                value={formData.lichess_id}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-light rounded-md text-text-dark"
                placeholder="For online tournaments only"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-accent rounded-md text-accent hover:bg-accent hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
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
