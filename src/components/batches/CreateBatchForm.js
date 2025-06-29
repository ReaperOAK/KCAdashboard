
import React, { useState, useEffect } from 'react';

const defaultSchedule = { days: [], time: '09:00', duration: 60 };

const CreateBatchForm = ({
  onClose,
  onSubmit,
  initialValues = {},
  teachers = null,
  mode = 'create',
  loading: externalLoading = false,
  error: externalError = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner',
    max_students: 10,
    teacher_id: '',
    status: 'active',
    ...initialValues,
    schedule: initialValues.schedule
      ? (typeof initialValues.schedule === 'string' ? initialValues.schedule : JSON.stringify(initialValues.schedule))
      : JSON.stringify(defaultSchedule)
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError(externalError);
  }, [externalError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let safeSchedule = '';
    try {
      JSON.parse(formData.schedule);
      safeSchedule = formData.schedule;
    } catch (e) {
      safeSchedule = JSON.stringify(defaultSchedule);
    }
    const submitData = { ...formData, schedule: safeSchedule };
    try {
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save batch');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Schedule UI logic
  let scheduleObj;
  try {
    scheduleObj = JSON.parse(formData.schedule || '{}');
  } catch {
    scheduleObj = defaultSchedule;
  }

  const handleDayToggle = (day) => {
    const days = scheduleObj.days.includes(day)
      ? scheduleObj.days.filter((d) => d !== day)
      : [...scheduleObj.days, day];
    setFormData((prev) => ({
      ...prev,
      schedule: JSON.stringify({ ...scheduleObj, days })
    }));
  };

  const handleScheduleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: JSON.stringify({ ...scheduleObj, [field]: value })
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || externalError) && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
          {error || externalError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Batch Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Students</label>
          <input
            type="number"
            name="max_students"
            min="1"
            value={formData.max_students}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
          />
        </div>
      </div>

      {teachers && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <button
                key={day}
                type="button"
                className={`px-2 py-1 rounded ${scheduleObj.days.includes(day)
                  ? 'bg-[#461fa3] text-white'
                  : 'bg-gray-200 text-gray-700'}`}
                onClick={() => handleDayToggle(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">Time</label>
              <input
                type="time"
                value={scheduleObj.time || '09:00'}
                onChange={(e) => handleScheduleChange('time', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Duration (minutes)</label>
              <input
                type="number"
                min="30"
                step="30"
                value={scheduleObj.duration || 60}
                onChange={(e) => handleScheduleChange('duration', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>
          </div>
        </div>
      </div>

      {formData.status !== undefined && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || externalLoading}
          className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb] disabled:opacity-50"
        >
          {loading || externalLoading
            ? (mode === 'edit' ? 'Saving...' : 'Creating...')
            : (mode === 'edit' ? 'Save Changes' : 'Create Batch')}
        </button>
      </div>
    </form>
  );
};

export default CreateBatchForm;
