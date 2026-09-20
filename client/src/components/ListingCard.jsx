import { Link } from 'react-router-dom';
import RatingStars from './RatingStars.jsx';

export default function ListingCard({ listing }) {
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

  return (
    <Link to={`/listings/${listing._id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {listing.image && (
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{listing.title}</h3>

          <div className="flex gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getBadgeColor(listing.category)}`}>
              {listing.category}
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeBadgeColor(listing.type)}`}>
              {listing.type}
            </span>
            {listing.createdBy?.reviewCount > 0 && <span className="rating-badge"><RatingStars value={Math.round(listing.createdBy.averageRating)} /> {listing.createdBy.averageRating.toFixed(1)}</span>}
          </div>

          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>📍 {listing.location}</span>
            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
          </div>

          {listing.createdBy && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                By <span className="font-semibold">{listing.createdBy.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
