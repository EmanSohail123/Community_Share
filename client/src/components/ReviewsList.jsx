import RatingStars from './RatingStars.jsx';

export default function ReviewsList({ reviews = [], emptyMessage = 'No reviews yet.' }) {
  if (!reviews.length) return <p className="empty-copy">{emptyMessage}</p>;

  return <div className="review-list">{reviews.map((review) => <article className="review-item" key={review._id}>
    <div className="review-item-head">
      <strong>{review.reviewerId?.name || 'Neighbor'}</strong>
      <RatingStars value={review.rating} />
    </div>
    <p>{review.comment || 'No written comment.'}</p>
    <small>{new Date(review.createdAt).toLocaleDateString()}</small>
  </article>)}</div>;
}
