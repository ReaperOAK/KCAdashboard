import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import ApiService from '../../utils/api';

const ChallengeList = ({ challenges, onAccept, onDecline, onRefresh }) => {
  // Format time control for display
  const formatTimeControl = (timeControl) => {
    if (!timeControl) return 'Standard';
    
    // Handle numeric time controls (in minutes)
    if (!isNaN(timeControl)) {
      return `${timeControl} min`;
    }
    
    // Handle structured time controls like "10+5"
    if (timeControl.includes('+')) {
      const [base, increment] = timeControl.split('+');
      return `${base} min + ${increment} sec`;
    }
    
    return timeControl;
  };
  
  // Format time ago
  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  // Handle accepting a challenge
  const handleAccept = async (id) => {
    try {
      const response = await ApiService.respondToChallenge(id, true);
      if (response.success && response.gameId) {
        if (onRefresh) onRefresh();
        if (onAccept) onAccept(response.gameId);
      }
    } catch (error) {
      console.error('Failed to accept challenge:', error);
    }
  };
  
  // Handle declining a challenge
  const handleDecline = async (id) => {
    try {
      await ApiService.respondToChallenge(id, false);
      if (onRefresh) onRefresh();
      if (onDecline) onDecline();
    } catch (error) {
      console.error('Failed to decline challenge:', error);
    }
  };

  // Group challenges by direction (incoming vs outgoing)
  const incomingChallenges = challenges.filter(c => c.direction === 'incoming');
  const outgoingChallenges = challenges.filter(c => c.direction === 'outgoing');
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-purple-900">Chess Challenges</h3>
      
      {challenges.length === 0 ? (
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No pending challenges</p>
        </div>
      ) : (
        <div className="space-y-6">
          {incomingChallenges.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-purple-800 mb-3">Incoming Challenges</h4>
              <div className="space-y-3">
                {incomingChallenges.map(challenge => (
                  <div key={challenge.id} className="bg-white border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-purple-900 mb-1">{challenge.challenger.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatTimeControl(challenge.time_control)}</div>                        <div className="text-xs text-gray-500">
                          You play as: {challenge.color === 'white' ? 'Black' : 'White'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(challenge.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          onClick={() => handleAccept(challenge.id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          onClick={() => handleDecline(challenge.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {outgoingChallenges.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-purple-800 mb-3">Outgoing Challenges</h4>
              <div className="space-y-3">
                {outgoingChallenges.map(challenge => (
                  <div key={challenge.id} className="bg-white border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-purple-900 mb-1">To: {challenge.recipient.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatTimeControl(challenge.time_control)}
                        </div>
                        <div className="text-xs text-gray-500">
                          You play as: {challenge.color}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(challenge.created_at)}
                        </div>
                      </div>
                      
                      <div>
                        <button 
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                          onClick={() => handleDecline(challenge.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <button className="w-full px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors" onClick={onRefresh}>
        Refresh Challenges
      </button>
    </div>
  );
};

export default ChallengeList;
