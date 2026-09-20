import { useState } from 'react';
import RatingStars from './RatingStars.jsx';
import { reviewsAPI } from '../api/reviews.js';

export default function ReviewForm({ revieweeId, listingId, onCreated }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!rating) return setError('Choose a star rating first');
    setSaving(true); setError('');
    try {
      const result = await reviewsAPI.create({ revieweeId, listingId, rating, comment });
      setRating(0); setComment('');
      onCreated?.(result);
    } catch (requestError) {
      setError(requestError.response?.status === 409
        ? 'You have already submitted a review for this exchange.'
        : requestError.response?.data?.message || requestError.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  }

  return <form className="review-form" onSubmit={submit}>
    <h3>Leave a review</h3>
    <RatingStars value={rating} onChange={setRating} size="1.5rem" />
    <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength="1000" rows="3" placeholder="How did the exchange go?" />
    {error && <p className="form-error">{error}</p>}
    <button className="button button-coral" disabled={saving}>{saving ? 'Saving...' : 'Submit review'}</button>
  </form>;
}
