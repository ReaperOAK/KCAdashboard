import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AuthApi } from '../../api/auth';

const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthApi.getActiveSessions();
      if (response.success) {
        setSessions(response.sessions);
      } else {
        setError(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError('Error fetching active sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLogoutAllOthers = useCallback(async () => {
    if (!window.confirm('Are you sure you want to log out all other devices? This will end all other active sessions.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await AuthApi.manageSessions('logout_all_others');
      if (response.success) {
        await fetchSessions();
        alert(`Successfully logged out ${response.sessions_removed} other sessions`);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError('Failed to logout other sessions: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }, [fetchSessions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (session) => {
    // Simple heuristic - could be enhanced with user agent detection
    return session.is_current ? 
      <ComputerDesktopIcon className="w-5 h-5 text-green-500" /> : 
      <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Active Sessions</h2>
        {sessions.length > 1 && (
          <button
            onClick={handleLogoutAllOthers}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <TrashIcon className="w-4 h-4" />
            {actionLoading ? 'Logging out...' : 'Logout Other Devices'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-lg border-2 transition-colors ${
                session.is_current 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {session.is_current ? 'Current Session' : 'Other Device'}
                      </span>
                      {session.is_current && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          This Device
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Started: {formatDate(session.created_at)}</p>
                      <p>Expires: {formatDate(session.expires_at)}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {session.token}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Session Management Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You can use your account on multiple devices simultaneously</li>
          <li>• Sessions automatically expire after 24 hours of inactivity</li>
          <li>• Use "Logout Other Devices" if you suspect unauthorized access</li>
          <li>• Always logout from public computers</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SessionManager;
