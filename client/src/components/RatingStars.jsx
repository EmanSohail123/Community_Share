export default function RatingStars({ value = 0, onChange, size = '1rem' }) {
  return <div className="rating-stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <button
      type="button"
      key={star}
      className={star <= value ? 'filled' : ''}
      style={{ fontSize: size }}
      onClick={() => onChange?.(star)}
      aria-label={`${star} star${star === 1 ? '' : 's'}`}
      disabled={!onChange}
    >&#9733;</button>)}
  </div>;
}
