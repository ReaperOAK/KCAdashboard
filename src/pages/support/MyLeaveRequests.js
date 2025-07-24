import React, { useEffect, useState } from 'react';
import { SupportApi } from '../../api/support';

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
      const data = await SupportApi.getMyLeaveRequests();
      // The API returns the array directly, not wrapped in an object
      setRequests(Array.isArray(data) ? data : []);
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
      await SupportApi.cancelMyLeaveRequest(id);
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
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
        <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
        My Leave Requests
      </h2>
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-dark">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
          <div className="text-lg font-medium mb-2">No leave requests found</div>
          <div className="text-gray-500">You haven't submitted any leave requests yet.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700 uppercase text-xs">
                <th className="px-3 py-3 text-left font-semibold">Start</th>
                <th className="px-3 py-3 text-left font-semibold">End</th>
                <th className="px-3 py-3 text-left font-semibold">Reason</th>
                <th className="px-3 py-3 text-left font-semibold">Status</th>
                <th className="px-3 py-3 text-left font-semibold">Admin Comment</th>
                <th className="px-3 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 transition-all">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(r.start_datetime).toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(r.end_datetime).toLocaleString()}</td>
                  <td className="px-3 py-2 max-w-xs break-words">{r.reason}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold 
                      ${r.status === 'pending' ? 'bg-warning/10 text-warning' :
                        r.status === 'approved' ? 'bg-success/10 text-success' :
                        r.status === 'rejected' ? 'bg-error/10 text-error' :
                        'bg-gray-200 text-gray-600'}
                    `}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs break-words text-gray-700">{r.admin_comment || <span className="text-gray-400">-</span>}</td>
                  <td className="px-3 py-2">
                    {r.status === 'pending' && (
                      <button
                        className="px-3 py-1 rounded-lg bg-error text-white hover:bg-error/80 transition-all text-xs font-medium disabled:opacity-60"
                        onClick={() => handleCancel(r.id)}
                        disabled={cancelStatus[r.id] === 'pending'}
                      >
                        Cancel
                      </button>
                    )}
                    {cancelStatus[r.id] === 'pending' && (
                      <span className="ml-2 text-warning animate-pulse">Cancelling...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyLeaveRequests;
