import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ClassRating = ({ classId, onRated }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/endpoints/classroom/rate-class.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId, rating, comment }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (onRated) onRated();
      } else {
        setError(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (submitted) return <div>Thank you for rating this class!</div>;

  return (
    <form onSubmit={handleSubmit} className="class-rating-form">
      <div>Rate this class:</div>
      <div>
        {[1,2,3,4,5].map((star) => (
          <span
            key={star}
            style={{ cursor: 'pointer', color: rating >= star ? '#f5b301' : '#ccc', fontSize: 24 }}
            onClick={() => setRating(star)}
            data-testid={`star-${star}`}
          >★</span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional comment"
        rows={2}
        style={{ width: '100%', marginTop: 8 }}
      />
      <button type="submit" disabled={rating === 0} style={{ marginTop: 8 }}>
        Submit Rating
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

ClassRating.propTypes = {
  classId: PropTypes.number.isRequired,
  onRated: PropTypes.func,
};

export default ClassRating;
