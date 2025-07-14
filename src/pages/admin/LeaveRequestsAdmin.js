
import React, { useEffect, useState, useCallback } from 'react';
import { SupportApi } from '../../api/support';
import LeaveRequestsSkeleton from '../../components/support/LeaveRequestsSkeleton';
import ErrorAlert from '../../components/support/ErrorAlert';
import EmptyState from '../../components/support/EmptyState';
import LeaveRequestsTable from '../../components/support/LeaveRequestsTable';

// Modal for comment input
const CommentModal = React.memo(function CommentModal({ open, onClose, onSubmit, status }) {
  const [comment, setComment] = useState('');
  React.useEffect(() => { if (open) setComment(''); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-2xl p-6 w-full max-w-md mx-2 animate-fade-in">
        <h3 className="text-xl font-semibold text-primary mb-2">{status === 'approved' ? 'Approve' : 'Reject'} Leave Request</h3>
        <label htmlFor="comment" className="block text-gray-dark mb-1">Comment <span className="text-accent">*</span></label>
        <textarea
          id="comment"
          className="w-full min-h-[80px] rounded-lg border border-gray-light px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent text-text-dark bg-background-light resize-none"
          value={comment}
          onChange={e => setComment(e.target.value)}
          autoFocus
          required
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-light text-primary hover:bg-gray-300 transition-all"
            onClick={onClose}
            type="button"
          >Cancel</button>
          <button
            className="px-4 py-2 rounded bg-accent text-white hover:bg-secondary transition-all disabled:opacity-60"
            onClick={() => { if (comment.trim()) onSubmit(comment); }}
            disabled={!comment.trim()}
            type="button"
          >Submit</button>
        </div>
      </div>
    </div>
  );
});


const LeaveRequestsAdmin = React.memo(function LeaveRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({});
  const [modal, setModal] = useState({ open: false, id: null, status: null });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupportApi.getLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open modal for comment
  const handleAction = useCallback((id, status) => {
    setModal({ open: true, id, status });
  }, []);

  // Handle modal submit
  const handleModalSubmit = async (comment) => {
    const { id, status } = modal;
    setActionStatus(s => ({ ...s, [id]: 'pending' }));
    setModal({ open: false, id: null, status: null });
    try {
      await SupportApi.approveLeave(id, status, comment);
      setActionStatus(s => ({ ...s, [id]: status }));
      fetchRequests();
    } catch (err) {
      setActionStatus(s => ({ ...s, [id]: 'error' }));
      setError('Failed to update status.');
    }
  };

  // Handle modal close
  const handleModalClose = () => setModal({ open: false, id: null, status: null });

  return (
    <div className="bg-background-light rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl mx-auto mt-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl text-primary font-bold mb-6 text-center">Teacher Leave Requests</h2>
      {loading && <LeaveRequestsSkeleton />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && requests.length === 0 && <EmptyState message="No leave requests found." />}
      {!loading && !error && requests.length > 0 && (
        <LeaveRequestsTable
          requests={requests}
          onAction={handleAction}
          actionStatus={actionStatus}
        />
      )}
      <CommentModal
        open={modal.open}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        status={modal.status}
      />
    </div>
  );
});

export default LeaveRequestsAdmin;
