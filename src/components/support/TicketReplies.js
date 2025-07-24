import React, { useState, useEffect, useCallback } from 'react';
import { SupportApi } from '../../api/support';

/**
 * TicketReplies component: Shows ticket replies and allows adding new replies
 * 
 * Props:
 *   - ticket: ticket object (required)
 *   - onReplyAdded: function called when a reply is added (optional)
 */
const TicketReplies = React.memo(function TicketReplies({ ticket, onReplyAdded }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (!ticket?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await SupportApi.getTicketReplies(ticket.id);
      setReplies(response.replies);
    } catch (err) {
      setError('Failed to load replies');
    } finally {
      setLoading(false);
    }
  }, [ticket?.id]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      setSubmitting(true);
      await SupportApi.addTicketReply(ticket.id, newReply.trim());
      setNewReply('');
      await fetchReplies();
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      setError('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleStyles = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-error/10 text-error border-l-4 border-error';
      case 'teacher':
        return 'bg-accent/10 text-accent border-l-4 border-accent';
      default:
        return 'bg-primary/10 text-primary border-l-4 border-primary';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Teacher';
      default:
        return 'Student';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Replies</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-primary">Replies ({replies.length})</h3>
      
      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Replies List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {replies.length === 0 ? (
          <div className="text-center text-gray-dark py-6">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-4 rounded-lg ${getRoleStyles(reply.user_role)} transition-all duration-200`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-dark">{reply.user_name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reply.user_role === 'admin' ? 'bg-error text-white' :
                    reply.user_role === 'teacher' ? 'bg-accent text-white' :
                    'bg-primary text-white'
                  }`}>
                    {getRoleBadge(reply.user_role)}
                  </span>
                </div>
                <span className="text-xs text-gray-dark">
                  {new Date(reply.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-text-dark whitespace-pre-wrap break-words">
                {reply.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Reply Form */}
      <form onSubmit={handleSubmitReply} className="border-t border-gray-light pt-4">
        <div className="mb-3">
          <label htmlFor="reply-message" className="block text-sm font-medium text-gray-dark mb-2">
            Add a reply
          </label>
          <textarea
            id="reply-message"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Type your reply here..."
            rows={4}
            className="w-full rounded-lg border border-gray-light bg-background-light dark:bg-background-dark shadow-sm focus:border-accent focus:ring-2 focus:ring-accent text-text-dark px-3 py-2 transition-all duration-200 resize-vertical"
            disabled={submitting}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newReply.trim() || submitting}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sending...
              </span>
            ) : (
              'Send Reply'
            )}
          </button>
        </div>
      </form>
    </div>
  );
});

export default TicketReplies;
