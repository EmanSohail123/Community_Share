import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import RatingStars from '../components/RatingStars.jsx';
import { reviewsAPI } from '../api/reviews.js';
import ReviewsList from '../components/ReviewsList.jsx';
import Navbar from '../components/Navbar.jsx';

export default function UserProfilePage() {
  const { userId } = useParams();
  const [data, setData] = useState({ reviews: [], averageRating: 0, reviewCount: 0 });
  const [error, setError] = useState('');

  useEffect(() => { reviewsAPI.getForUser(userId).then(setData).catch((requestError) => setError(requestError.message)); }, [userId]);

  return <main className="page-shell"><Navbar /><section className="profile-page"><Link className="text-link" to="/listings">Back to listings</Link><p className="eyebrow">Community profile</p><h1>Neighbor reviews</h1><div className="profile-rating"><RatingStars value={Math.round(data.averageRating)} /><strong>{data.averageRating ? data.averageRating.toFixed(1) : 'No rating yet'}</strong><span>{data.reviewCount} review{data.reviewCount === 1 ? '' : 's'}</span></div>{error && <p className="form-error">{error}</p>}<ReviewsList reviews={data.reviews} /></section></main>;
}
