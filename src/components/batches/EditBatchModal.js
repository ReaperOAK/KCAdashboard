import React from 'react';
import Modal from '../../components/common/Modal';
import { SchedulePicker } from '../../components/batches/CreateBatchForm';
/**
 * Edit batch modal form for batch detail page.
 * Accessible, beautiful, and uses color tokens.
 */

const EditBatchModal = ({ open, onClose, formData, onChange, onSubmit }) => {
  if (!open) return null;
  return (
    <Modal title="Edit Batch" onClose={onClose} className="max-w-lg w-full px-2 sm:px-0 py-0 bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light  focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300" overlayClassName="bg-black/40 backdrop-blur-sm" aria-modal="true" role="dialog" aria-label="Edit Batch Modal">
      <form onSubmit={onSubmit} className="space-y-4 p-2 sm:p-6 " aria-label="Edit batch form">
        <div>
          <label className="block text-sm font-medium text-primary">Batch Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch description"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-primary">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Batch level"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Batch status"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary">Max Students</label>
            <input
              type="number"
              name="max_students"
              value={formData.max_students}
              onChange={onChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Max students"
            />
          </div>
        </div>
        {/* SchedulePicker full width below grid */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-primary mb-1">Schedule</label>
          <SchedulePicker
            value={formData.schedule}
            onChange={val => onChange({ target: { name: 'schedule', value: val } })}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-light rounded-md text-primary bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-md shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default React.memo(EditBatchModal);
