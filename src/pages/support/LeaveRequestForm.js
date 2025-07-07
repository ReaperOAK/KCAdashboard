import React, { useState } from 'react';
import ApiService from '../../utils/api';

const LeaveRequestForm = () => {
  const [form, setForm] = useState({ start_datetime: '', end_datetime: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await ApiService.post('/support/leave/request.php', form);
      setSuccess('Leave request submitted!');
      setForm({ start_datetime: '', end_datetime: '', reason: '' });
    } catch (err) {
      setError('Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-primary mb-2">Request Leave</h2>
      {success && <div className="text-green-700 mb-2">{success}</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="start-dt">Start Date/Time</label>
        <input
          id="start-dt"
          name="start_datetime"
          type="datetime-local"
          value={form.start_datetime}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="end-dt">End Date/Time</label>
        <input
          id="end-dt"
          name="end_datetime"
          type="datetime-local"
          value={form.end_datetime}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reason">Reason</label>
        <textarea
          id="reason"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Leave Request'}
      </button>
    </form>
  );
};

export default LeaveRequestForm;
