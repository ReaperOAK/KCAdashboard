import React, { useState } from 'react';
import { SupportApi } from '../../api/support';

const SupportTicketForm = () => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
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
      await SupportApi.createTicket(form);
      setSuccess('Ticket submitted successfully!');
      setForm({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      setError('Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-primary mb-2">Raise a Support Ticket</h2>
      {success && <div className="text-green-700 mb-2">{success}</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="ticket-title">Title</label>
        <input
          id="ticket-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="ticket-description">Description</label>
        <textarea
          id="ticket-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="ticket-priority">Priority</label>
        <select
          id="ticket-priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-secondary text-white rounded hover:bg-accent"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  );
};

export default SupportTicketForm;
