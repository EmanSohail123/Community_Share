import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../api/listings';

export default function BrowseListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const currentKeyword = searchParams.get('keyword') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentType = searchParams.get('type') || '';

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentKeyword) params.keyword = currentKeyword;
      if (currentCategory) params.category = currentCategory;
      if (currentType) params.type = currentType;

      const data = await listingsAPI.getAll(params);
      setListings(data);
    } catch (err) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword) => {
    if (keyword) {
      setSearchParams({ ...Object.fromEntries(searchParams), keyword });
    } else {
      searchParams.delete('keyword');
      setSearchParams(searchParams);
    }
  };

  const handleCategoryFilter = (category) => {
    if (category) {
      setSearchParams({ ...Object.fromEntries(searchParams), category });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const handleTypeFilter = (type) => {
    if (type) {
      setSearchParams({ ...Object.fromEntries(searchParams), type });
    } else {
      searchParams.delete('type');
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Browse Listings</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={currentKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by title, description..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={currentCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              <option value="Tool">Tool</option>
              <option value="Skill">Skill</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={currentType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Types</option>
              <option value="Offer">Offering</option>
              <option value="Request">Requesting</option>
            </select>
          </div>
        </div>

        {(currentKeyword || currentCategory || currentType) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-emerald-600 hover:text-emerald-800 font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No listings found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
