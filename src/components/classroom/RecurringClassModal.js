import React, { useState, useCallback, useEffect } from 'react';
import { ClassroomApi } from '../../api/classroom';
import { getCurrentDateIST } from '../../utils/dateUtils';
import { BatchesApi } from '../../api/batches';
import ModalOverlay from './ModalOverlay';

const RecurringClassModal = ({ classroom, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [batchSchedule, setBatchSchedule] = useState(null);
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    numWeeks: 4,
    type: 'offline',
    meeting_link: '',
    description: '',
    useCustomDuration: false,
    customDuration: 60
  });

  // Fetch batch schedule on mount
  useEffect(() => {
    const fetchBatchSchedule = async () => {
      try {
        const response = await BatchesApi.getBatchDetails(classroom.id);
        if (response.success && response.batch?.schedule) {
          let schedule;
          if (typeof response.batch.schedule === 'string') {
            schedule = JSON.parse(response.batch.schedule);
          } else {
            schedule = response.batch.schedule;
          }
          setBatchSchedule(schedule);
          
          // Set default duration from batch schedule
          setForm(prev => ({
            ...prev,
            customDuration: schedule.duration || 60
          }));
        }
      } catch (err) {
        setError('Failed to load batch schedule');
      }
    };

    if (classroom?.id) {
      fetchBatchSchedule();
    }
  }, [classroom]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!batchSchedule || !batchSchedule.days || batchSchedule.days.length === 0) {
      setError('No schedule found for this batch. Please ensure the batch has a valid schedule.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ClassroomApi.createRecurringSessions({
        classroom_id: classroom.id,
        title: form.title,
        start_date: form.startDate,
        end_date: form.endDate,
        num_weeks: form.numWeeks,
        type: form.type,
        meeting_link: form.meeting_link,
        description: form.description,
        duration: form.useCustomDuration ? form.customDuration : batchSchedule.duration,
        schedule: batchSchedule
      });

      if (response.success) {
        onSuccess(response.sessions_created);
        onClose();
      } else {
        setError(response.message || 'Failed to create recurring sessions');
      }
    } catch (err) {
      setError('Error creating recurring sessions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [classroom, form, batchSchedule, onSuccess, onClose]);

  const formatSchedule = (schedule) => {
    if (!schedule?.days || schedule.days.length === 0) return 'No schedule';
    return `${schedule.days.join(', ')} at ${schedule.time} (${schedule.duration} min)`;
  };

  const calculatePreviewDates = () => {
    if (!form.startDate || !batchSchedule?.days) return [];
    
    const startDate = new Date(form.startDate);
    const endDate = form.endDate ? new Date(form.endDate) : new Date(startDate.getTime() + (form.numWeeks * 7 * 24 * 60 * 60 * 1000));
    
    const dates = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      if (batchSchedule.days.includes(dayName)) {
        dates.push(new Date(d));
      }
    }
    
    return dates.slice(0, 20); // Limit preview to 20 sessions
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Create Recurring Classes
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {batchSchedule && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">Batch Schedule</h3>
            <p className="text-blue-700">{formatSchedule(batchSchedule)}</p>
            <p className="text-sm text-blue-600 mt-1">
              This is the current schedule.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="title">
              Session Title Template
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              placeholder="e.g., Chess Class - Week {week}"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {`{week}`} for week number and {`{date}`} for session date
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleInputChange}
                min={getCurrentDateIST()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="endDate">
                End Date (Optional)
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleInputChange}
                min={getCurrentDateIST()}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="numWeeks">
              Number of Weeks (if no end date)
            </label>
            <input
              id="numWeeks"
              type="number"
              name="numWeeks"
              value={form.numWeeks}
              onChange={handleInputChange}
              min="1"
              max="52"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="type">
                Session Type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="useCustomDuration"
                  checked={form.useCustomDuration}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="text-sm font-medium text-gray-700">Custom Duration</span>
              </label>
              {form.useCustomDuration && (
                <input
                  type="number"
                  name="customDuration"
                  value={form.customDuration}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                  placeholder="Duration in minutes"
                />
              )}
            </div>
          </div>

          {form.type === 'online' && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="meeting_link">
                Meeting Link
              </label>
              <input
                id="meeting_link"
                type="url"
                name="meeting_link"
                value={form.meeting_link}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="description">
              Description Template
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
              placeholder="Description for all sessions..."
            />
          </div>

          {/* Preview */}
          {form.startDate && batchSchedule && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Preview (First few sessions)</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {calculatePreviewDates().map((date, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {date.toLocaleDateString()} ({['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}) at {batchSchedule.time}
                  </div>
                ))}
                {calculatePreviewDates().length > 20 && (
                  <div className="text-sm text-gray-500 italic">... and more</div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Total sessions to create: {calculatePreviewDates().length}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Recurring Classes'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

export default RecurringClassModal;
