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
    <div className="bg-[#f8f8fc] rounded-lg p-4 mb-6 shadow-sm">
      <h3 className="mt-0 text-[#200e4a] text-lg border-b border-[#e0e0f0] pb-2 mb-4">Chess Challenges</h3>
      
      {challenges.length === 0 ? (
        <div className="text-center text-gray-600 py-5">
          <p>No pending challenges</p>
        </div>
      ) : (
        <div className="mb-4">
          {incomingChallenges.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base text-[#461fa3] mb-3">Incoming Challenges</h4>
              <ul className="list-none p-0 m-0 mb-4">
                {incomingChallenges.map(challenge => (
                  <li key={challenge.id} className="flex justify-between items-center p-3 rounded-md mb-2 bg-[rgba(70,31,163,0.05)] border-l-3 border-[#461fa3] sm:flex-row flex-col sm:items-center items-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#200e4a]">{challenge.challenger.name}</span>
                      <span className="text-sm text-gray-600">
                        {formatTimeControl(challenge.time_control)}
                      </span>
                      <span className="text-sm text-gray-600">
                        You play as: {challenge.color === 'white' ? 'Black' : 'White'}
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        {formatTimeAgo(challenge.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 sm:mt-0 mt-2 sm:self-auto self-end">
                      <button 
                        className="bg-[#461fa3] text-white border-none rounded px-3 py-1.5 font-medium cursor-pointer transition-all hover:bg-[#3a1982]"
                        onClick={() => handleAccept(challenge.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="bg-[#f3f1f9] text-[#461fa3] border border-[#461fa3] rounded px-3 py-1.5 font-medium cursor-pointer transition-all hover:bg-[#f8e4e4] hover:text-[#af0505] hover:border-[#af0505]"
                        onClick={() => handleDecline(challenge.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {outgoingChallenges.length > 0 && (
            <div>
              <h4 className="text-base text-[#461fa3] mb-3">Outgoing Challenges</h4>
              <ul className="list-none p-0 m-0 mb-4">
                {outgoingChallenges.map(challenge => (
                  <li key={challenge.id} className="flex justify-between items-center p-3 rounded-md mb-2 bg-[rgba(32,14,74,0.05)] border-l-3 border-[#200e4a] sm:flex-row flex-col sm:items-center items-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#200e4a]">To: {challenge.recipient.name}</span>
                      <span className="text-sm text-gray-600">
                        {formatTimeControl(challenge.time_control)}
                      </span>
                      <span className="text-sm text-gray-600">
                        You play as: {challenge.color}
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        {formatTimeAgo(challenge.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 sm:mt-0 mt-2 sm:self-auto self-end">
                      <button 
                        className="bg-[#f3f1f9] text-[#461fa3] border border-[#461fa3] rounded px-3 py-1.5 font-medium cursor-pointer transition-all hover:bg-[#f8e4e4] hover:text-[#af0505] hover:border-[#af0505]"
                        onClick={() => handleDecline(challenge.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <button 
        className="bg-[#f3f1f9] text-[#461fa3] border-none rounded px-3 py-2 font-medium cursor-pointer transition-colors hover:bg-[#e5e1f5] block mx-auto"
        onClick={onRefresh}
      >
        Refresh Challenges
      </button>
    </div>
  );
};

export default ChallengeList;
