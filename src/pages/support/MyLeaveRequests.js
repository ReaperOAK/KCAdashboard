import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/api';

const MyLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelStatus, setCancelStatus] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.get('/support/leave/my-requests.php');
      setRequests(data);
    } catch (err) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    setCancelStatus(s => ({ ...s, [id]: 'pending' }));
    try {
      await ApiService.post('/support/leave/my-requests.php', { id });
      setCancelStatus(s => ({ ...s, [id]: 'cancelled' }));
      fetchRequests();
    } catch (err) {
      setCancelStatus(s => ({ ...s, [id]: 'error' }));
      alert('Failed to cancel leave request.');
    }
  };

  if (loading) return <div>Loading your leave requests...</div>;
  if (error) return <div className="text-red-700">{error}</div>;
  if (!requests.length) return <div>No leave requests found.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">My Leave Requests</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Admin Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id} className="border-b">
              <td>{r.start_datetime}</td>
              <td>{r.end_datetime}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>{r.admin_comment || '-'}</td>
              <td>
                {r.status === 'pending' && (
                  <button className="btn btn-danger" onClick={() => handleCancel(r.id)} disabled={cancelStatus[r.id] === 'pending'}>
                    Cancel
                  </button>
                )}
                {cancelStatus[r.id] === 'pending' && <span> Cancelling...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLeaveRequests;
