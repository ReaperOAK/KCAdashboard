import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import ApiService from '../../utils/api';
import './ChallengeList.css';

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
      if (response.success) {
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
    <div className="challenge-list">
      <h3>Chess Challenges</h3>
      
      {challenges.length === 0 ? (
        <div className="no-challenges">
          <p>No pending challenges</p>
        </div>
      ) : (
        <div className="challenges-container">
          {incomingChallenges.length > 0 && (
            <div className="challenge-section">
              <h4>Incoming Challenges</h4>
              <ul className="challenges">
                {incomingChallenges.map(challenge => (
                  <li key={challenge.id} className="challenge-item incoming">
                    <div className="challenge-info">
                      <span className="challenger-name">{challenge.challenger.name}</span>
                      <span className="challenge-time-control">
                        {formatTimeControl(challenge.time_control)}
                      </span>
                      <span className="challenge-color">
                        You play as: {challenge.color === 'white' ? 'Black' : 'White'}
                      </span>
                      <span className="challenge-time">
                        {formatTimeAgo(challenge.created_at)}
                      </span>
                    </div>
                    
                    <div className="challenge-actions">
                      <button 
                        className="accept-btn"
                        onClick={() => handleAccept(challenge.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="decline-btn"
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
            <div className="challenge-section">
              <h4>Outgoing Challenges</h4>
              <ul className="challenges">
                {outgoingChallenges.map(challenge => (
                  <li key={challenge.id} className="challenge-item outgoing">
                    <div className="challenge-info">
                      <span className="recipient-name">To: {challenge.recipient.name}</span>
                      <span className="challenge-time-control">
                        {formatTimeControl(challenge.time_control)}
                      </span>
                      <span className="challenge-color">
                        You play as: {challenge.color}
                      </span>
                      <span className="challenge-time">
                        {formatTimeAgo(challenge.created_at)}
                      </span>
                    </div>
                    
                    <div className="challenge-actions">
                      <button 
                        className="cancel-btn"
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
      
      <button className="refresh-btn" onClick={onRefresh}>
        Refresh Challenges
      </button>
    </div>
  );
};

export default ChallengeList;
