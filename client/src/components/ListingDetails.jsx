import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listingsAPI } from '../api/listings';
import ListingForm from './ListingForm';
import RatingStars from './RatingStars.jsx';
import ReviewsList from './ReviewsList.jsx';
import { reviewsAPI } from '../api/reviews.js';

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reviewData, setReviewData] = useState({ reviews: [], averageRating: 0, reviewCount: 0 });

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const data = await listingsAPI.getById(id);
      setListing(data);
      const creatorReviews = await reviewsAPI.getForUser(data.createdBy._id);
      setReviewData(creatorReviews);
    } catch (err) {
      setError(err.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setDeleting(true);
    try {
      await listingsAPI.delete(id);
      navigate('/listings');
    } catch (err) {
      setError(err.message || 'Failed to delete listing');
      setDeleting(false);
    }
  };

  const contactOwner = () => navigate(`/messages?receiver=${listing.createdBy._id}&listing=${listing._id}`);

  const isOwner = user && listing && user.id === listing.createdBy._id;

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!listing) return <div className="text-center py-8">Listing not found</div>;

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <ListingForm
          initialData={listing}
          onSuccess={() => {
            setIsEditing(false);
            fetchListing();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const getBadgeColor = (category) => {
    const colors = {
      Tool: 'bg-blue-100 text-blue-800',
      Skill: 'bg-green-100 text-green-800',
      Service: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadgeColor = (type) => {
    return type === 'Offer'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  };

  const reviewCount = reviewData.reviews.length;
  const averageRating = reviewCount
    ? reviewData.reviews.reduce((total, review) => total + Number(review.rating), 0) / reviewCount
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/listings')}
        className="mb-4 text-emerald-600 hover:text-emerald-800 font-semibold"
      >
        ← Back to Listings
      </button>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        {listing.image && (
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{listing.title}</h1>

          <div className="flex gap-2 mb-4 flex-wrap">
            <span className={`text-sm font-semibold px-3 py-1 rounded ${getBadgeColor(listing.category)}`}>
              {listing.category}
            </span>
            <span className={`text-sm font-semibold px-3 py-1 rounded ${getTypeBadgeColor(listing.type)}`}>
              {listing.type}
            </span>
          </div>

          <p className="text-gray-600 text-lg mb-4">{listing.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-800">📍 Location</p>
              <p>{listing.location}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">📅 Posted</p>
              <p>{new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-bold mb-3">Posted by</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="font-semibold"><Link className="text-link" to={`/profiles/${listing.createdBy._id}`}>{listing.createdBy.name}</Link></p>
              <p className="text-gray-600 text-sm">{listing.createdBy.email}</p>
              <div className="profile-rating"><RatingStars value={Math.round(averageRating)} /><span>{reviewCount ? `${averageRating.toFixed(1)} (${reviewCount})` : 'No reviews yet'}</span></div>
              {listing.createdBy.location && (
                <p className="text-gray-600 text-sm">📍 {listing.createdBy.location}</p>
              )}
            </div>
            {listing.createdBy.profilePicture && (
              <img
                src={listing.createdBy.profilePicture}
                alt={listing.createdBy.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
          </div>
          {!isOwner && user && (
            <button onClick={contactOwner} className="button button-coral mt-4">Contact {listing.type === 'Offer' ? 'Seller' : 'Requester'} ↗</button>
          )}
        </div>

        <section className="listing-reviews border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Reviews for {listing.createdBy.name}</h2>
          <ReviewsList reviews={reviewData.reviews} />
        </section>

        {isOwner && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-semibold transition"
            >
              Edit Listing
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 transition"
            >
              {deleting ? 'Deleting...' : 'Delete Listing'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
