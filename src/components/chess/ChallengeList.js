
import React, { useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ApiService from '../../utils/api';

// Util: Format time control for display
const formatTimeControl = (timeControl) => {
  if (!timeControl) return 'Standard';
  if (!isNaN(timeControl)) return `${timeControl} min`;
  if (typeof timeControl === 'string' && timeControl.includes('+')) {
    const [base, increment] = timeControl.split('+');
    return `${base} min + ${increment} sec`;
  }
  return timeControl;
};

// Util: Format time ago
const formatTimeAgo = (dateString) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

// Button: Accept/Decline/Cancel
const ChallengeActionButton = React.memo(function ChallengeActionButton({ label, onClick, colorClass, ariaLabel }) {
  return (
    <button
      type="button"
      className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${colorClass}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
});

// Card: Challenge
const ChallengeCard = React.memo(function ChallengeCard({ challenge, type, onAccept, onDecline }) {
  const isIncoming = type === 'incoming';
  const borderColor = isIncoming ? 'border-green-500' : 'border-blue-500';
  const playerLabel = isIncoming
    ? `You play as: ${challenge.color === 'white' ? 'Black' : 'White'}`
    : `You play as: ${challenge.color}`;
  return (
    <div
      className={`bg-white border-l-4 ${borderColor} p-4 rounded-lg shadow-sm flex justify-between items-start`}
      role="region"
      aria-label={isIncoming ? `Challenge from ${challenge.challenger.name}` : `Challenge to ${challenge.recipient.name}`}
      tabIndex={0}
    >
      <div className="flex-1">
        <div className="font-semibold text-primary mb-1">
          {isIncoming ? challenge.challenger.name : `To: ${challenge.recipient.name}`}
        </div>
        <div className="text-sm text-gray-dark mb-2">{formatTimeControl(challenge.time_control)}</div>
        <div className="text-xs text-gray-dark">{playerLabel}</div>
        <div className="text-xs text-gray-dark">{formatTimeAgo(challenge.created_at)}</div>
      </div>
      <div className="flex gap-2 ml-4">
        {isIncoming ? (
          <>
            <ChallengeActionButton
              label="Accept"
              onClick={onAccept}
              colorClass="bg-green-600 text-white hover:bg-green-700"
              ariaLabel={`Accept challenge from ${challenge.challenger.name}`}
            />
            <ChallengeActionButton
              label="Decline"
              onClick={onDecline}
              colorClass="bg-red-600 text-white hover:bg-red-700"
              ariaLabel={`Decline challenge from ${challenge.challenger.name}`}
            />
          </>
        ) : (
          <ChallengeActionButton
            label="Cancel"
            onClick={onDecline}
            colorClass="bg-gray-dark text-white hover:bg-gray-600"
            ariaLabel={`Cancel challenge to ${challenge.recipient.name}`}
          />
        )}
      </div>
    </div>
  );
});

// Section: Challenge List
export const ChallengeList = React.memo(function ChallengeList({ challenges, onAccept, onDecline, onRefresh }) {
  // Memoize challenge groups for performance
  const incomingChallenges = useMemo(() => challenges.filter(c => c.direction === 'incoming'), [challenges]);
  const outgoingChallenges = useMemo(() => challenges.filter(c => c.direction === 'outgoing'), [challenges]);

  // Memoized handlers to avoid unnecessary re-renders
  const handleAccept = useCallback(
    async (id) => {
      try {
        const response = await ApiService.respondToChallenge(id, true);
        if (response.success && response.gameId) {
          onRefresh && onRefresh();
          onAccept && onAccept(response.gameId);
        }
      } catch (error) {
        // Centralized error boundary should catch, but log for dev
        // eslint-disable-next-line no-console
        console.error('Failed to accept challenge:', error);
      }
    },
    [onAccept, onRefresh]
  );

  const handleDecline = useCallback(
    async (id, isIncoming) => {
      try {
        await ApiService.respondToChallenge(id, false);
        onRefresh && onRefresh();
        if (isIncoming) {
          onDecline && onDecline();
        }
      } catch (error) {
        // Centralized error boundary should catch, but log for dev
        // eslint-disable-next-line no-console
        console.error('Failed to decline/cancel challenge:', error);
      }
    },
    [onDecline, onRefresh]
  );

  return (
    <section className="space-y-4" aria-label="Chess Challenges" >
      <h3 className="text-lg font-semibold text-primary">Chess Challenges</h3>

      {challenges.length === 0 ? (
        <div className="bg-background-light p-6 rounded-lg text-center">
          <p className="text-gray-dark">No pending challenges</p>
        </div>
      ) : (
        <div className="space-y-6">
          {incomingChallenges.length > 0 && (
            <section aria-label="Incoming Challenges" className="space-y-3">
              <h4 className="text-md font-medium text-secondary mb-3">Incoming Challenges</h4>
              {incomingChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  type="incoming"
                  onAccept={() => handleAccept(challenge.id)}
                  onDecline={() => handleDecline(challenge.id, true)}
                />
              ))}
            </section>
          )}
          {outgoingChallenges.length > 0 && (
            <section aria-label="Outgoing Challenges" className="space-y-3">
              <h4 className="text-md font-medium text-secondary mb-3">Outgoing Challenges</h4>
              {outgoingChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  type="outgoing"
                  onDecline={() => handleDecline(challenge.id, false)}
                />
              ))}
            </section>
          )}
        </div>
      )}

      <ChallengeActionButton
        label="Refresh Challenges"
        onClick={onRefresh}
        colorClass="w-full px-4 py-2 bg-accent text-white rounded hover:bg-secondary"
        ariaLabel="Refresh chess challenges"
      />
    </section>
  );
});

export default ChallengeList;
