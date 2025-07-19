import React, { useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChessApi } from '../../api/chess';

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

// Helper: Format time in IST
const formatIST = (dateString) => {
  if (!dateString) return '';
  try {
    let s = dateString;
    if (s && !s.includes('T')) s = s.replace(' ', 'T');
    if (s && !s.endsWith('Z')) s += 'Z';
    const d = new Date(s);
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  } catch {
    return dateString;
  }
};

// Util: Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    let s = dateString;
    if (s && !s.includes('T')) s = s.replace(' ', 'T');
    if (s && !s.endsWith('Z')) s += 'Z';
    const d = new Date(s);
    if (isNaN(d.getTime())) return dateString;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return dateString;
  }
};

// Button: Accept/Decline/Cancel
const ChallengeActionButton = React.memo(function ChallengeActionButton({ label, onClick, colorClass, ariaLabel, disabled = false }) {
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 ${colorClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
      disabled={disabled}
      tabIndex={0}
    >
      {label}
    </button>
  );
});

// Card: Challenge
const ChallengeCard = React.memo(function ChallengeCard({ challenge, type, onAccept, onDecline }) {
  const isIncoming = type === 'incoming';
  const borderColor = isIncoming ? 'border-green-600' : 'border-accent';
  const playerLabel = isIncoming
    ? `You play as: ${challenge.color === 'white' ? 'Black' : 'White'}`
    : `You play as: ${challenge.color}`;
  return (
    <div
      className={`bg-background-light dark:bg-background-dark border-l-4 ${borderColor} p-4 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200`}
      role="region"
      aria-label={isIncoming ? `Challenge from ${challenge.challenger.name}` : `Challenge to ${challenge.recipient.name}`}
      tabIndex={0}
    >
      <div className="flex-1 w-full">
        <div className="font-semibold text-primary mb-1 text-lg">
          {isIncoming ? challenge.challenger.name : `To: ${challenge.recipient.name}`}
        </div>
        <div className="text-sm text-gray-dark mb-2">{formatTimeControl(challenge.time_control)}</div>
        <div className="text-xs text-secondary font-medium mb-1">{playerLabel}</div>
        <div className="text-xs text-gray-dark">{formatTimeAgo(challenge.created_at)}</div>
        <div className="text-xs text-gray-dark">{formatIST(challenge.created_at)}</div>
      </div>
      <div className="flex gap-2 w-full md:w-auto justify-end md:justify-start">
        {isIncoming ? (
          <>
            <ChallengeActionButton
              label="Accept"
              onClick={onAccept}
              colorClass="bg-success text-white hover:bg-green-700 focus:ring-success"
              ariaLabel={`Accept challenge from ${challenge.challenger.name}`}
            />
            <ChallengeActionButton
              label="Decline"
              onClick={onDecline}
              colorClass="bg-highlight text-white hover:bg-red-700 focus:ring-highlight"
              ariaLabel={`Decline challenge from ${challenge.challenger.name}`}
            />
          </>
        ) : (
          <ChallengeActionButton
            label="Cancel"
            onClick={onDecline}
            colorClass="bg-gray-dark text-white hover:bg-gray-light focus:ring-gray-dark"
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
        const response = await ChessApi.respondToChallenge(id, true);
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
        await ChessApi.respondToChallenge(id, false);
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
    <section className="space-y-6 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-2 sm:px-0" aria-label="Chess Challenges" >
      <h3 className="text-2xl font-semibold text-text-dark mb-4">Chess Challenges</h3>

      {challenges.length === 0 ? (
        <div className="bg-background-light dark:bg-background-dark p-8 rounded-xl text-center shadow-md">
          <p className="text-gray-dark text-lg">No pending challenges</p>
        </div>
      ) : (
        <div className="space-y-8">
          {incomingChallenges.length > 0 && (
            <section aria-label="Incoming Challenges" className="space-y-4">
              <h4 className="text-xl font-medium text-secondary mb-4">Incoming Challenges</h4>
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
            <section aria-label="Outgoing Challenges" className="space-y-4">
              <h4 className="text-xl font-medium text-secondary mb-4">Outgoing Challenges</h4>
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

      <div className="mt-6">
        <ChallengeActionButton
          label="Refresh Challenges"
          onClick={onRefresh}
          colorClass="w-full px-4 py-2 bg-accent text-white rounded-xl hover:bg-secondary focus:ring-accent"
          ariaLabel="Refresh chess challenges"
        />
      </div>
    </section>
  );
});

export default ChallengeList;
