
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PropTypes from 'prop-types';
import ApiService from '../../utils/api';


const ClassRating = ({ classId, onRated }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!user || !user.id) {
      setError('User not found. Please log in again.');
      return;
    }
    try {
      const data = await ApiService.post('/classroom/rate-class.php', {
        class_id: classId,
        student_id: user.id,
        rating,
        comment,
      });
      if (data.success) {
        setSubmitted(true);
        if (onRated) onRated();
      } else {
        setError(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      setError(err.message || 'Network error');
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
