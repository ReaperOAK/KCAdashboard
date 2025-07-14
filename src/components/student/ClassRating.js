

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PropTypes from 'prop-types';
import { ClassroomApi } from '../../api/classroom';

// StarRating: Pure, focused, reusable
const StarRating = React.memo(function StarRating({ value, onChange, disabled, size = 28, label = 'Rating' }) {
  return (
    <div className="flex items-center gap-1" aria-label={label} role="radiogroup">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={[
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent',
            value >= star ? 'text-[#f5b301]' : 'text-gray-light',
            disabled ? 'cursor-not-allowed opacity-60' : 'hover:text-accent cursor-pointer',
          ].join(' ')}
          style={{ fontSize: size }}
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          role="radio"
          tabIndex={0}
          onClick={() => !disabled && onChange(star)}
          onKeyDown={e => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) onChange(star);
          }}
          data-testid={`star-${star}`}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
});

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.number,
  label: PropTypes.string,
};

// ClassRating: handles API, state, and layout only
const ClassRating = React.memo(function ClassRating({ classId, onRated }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => rating > 0 && !loading, [rating, loading]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    if (!user || !user.id) {
      setError('User not found. Please log in again.');
      return;
    }
    setLoading(true);
    try {
      const data = await ClassroomApi.rateClass(classId, user.id, rating, comment);
      if (data.success) {
        setSubmitted(true);
        if (onRated) onRated();
      } else {
        setError(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [user, classId, rating, comment, onRated]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-6 bg-background-light dark:bg-background-dark rounded-lg shadow-md animate-fade-in">
        <span className="text-2xl text-success font-semibold">Thank you for rating this class!</span>
        <span className="text-gray-dark text-sm">Your feedback helps us improve.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-background-light dark:bg-background-dark rounded-xl shadow-lg p-6 flex flex-col gap-4 animate-fade-in border border-gray-light"
      aria-label="Class Rating Form"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="class-rating-stars" className="text-lg font-medium text-primary mb-1">Rate this class</label>
        <StarRating
          value={rating}
          onChange={setRating}
          disabled={loading}
          size={32}
          label="Class rating stars"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="class-rating-comment" className="text-sm text-gray-dark">Comments <span className="text-gray-light">(optional)</span></label>
        <textarea
          id="class-rating-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="resize-none rounded-md border border-gray-light bg-white dark:bg-background-dark px-3 py-2 text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          maxLength={300}
          disabled={loading}
        />
        <div className="text-xs text-gray-dark text-right">{comment.length}/300</div>
      </div>
      <button
        type="submit"
        className={[
          'w-full py-2 rounded-md font-semibold transition-all duration-200',
          'bg-primary text-white hover:bg-secondary',
          'focus:outline-none focus:ring-2 focus:ring-accent',
          !canSubmit ? 'bg-gray-dark text-gray-light cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            Submitting...
          </span>
        ) : 'Submit Rating'}
      </button>
      {error && (
        <div className="bg-error text-white rounded-md px-3 py-2 mt-2 text-sm border border-error animate-fade-in" role="alert">
          {error}
        </div>
      )}
    </form>
  );
});

ClassRating.propTypes = {
  classId: PropTypes.number.isRequired,
  onRated: PropTypes.func,
};

export default ClassRating;
