import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { listingsAPI } from '../api/listings';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar.jsx';

function ListingsMap({ listings }) {
  const points = listings.filter((listing) => listing.coordinates?.lat != null && listing.coordinates?.lng != null);
  const center = points[0] ? [points[0].coordinates.lat, points[0].coordinates.lng] : [40.7128, -74.006];
  return <MapContainer className="listings-map" center={center} zoom={12} scrollWheelZoom><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{points.map((listing) => <Marker key={listing._id} position={[listing.coordinates.lat, listing.coordinates.lng]}><Popup><strong>{listing.title}</strong><br />{listing.location}</Popup></Marker>)}</MapContainer>;
}

export default function BrowseListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('grid');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(25);

  const currentKeyword = searchParams.get('keyword') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentType = searchParams.get('type') || '';

  const visibleListings = listings.filter((listing) => {
    if (!userLocation || !listing.coordinates) return true;
    const latDistance = (listing.coordinates.lat - userLocation.lat) * 111;
    const lngDistance = (listing.coordinates.lng - userLocation.lng) * 111 * Math.cos(userLocation.lat * Math.PI / 180);
    return Math.sqrt(latDistance ** 2 + lngDistance ** 2) <= radius;
  });

  const locateUser = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }), () => setError('Location permission was not granted.'));

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
      const listingsWithCoordinates = data.filter((listing) => (
        listing.coordinates?.lat != null &&
        listing.coordinates?.lng != null &&
        Number.isFinite(Number(listing.coordinates?.lat)) &&
        Number.isFinite(Number(listing.coordinates?.lng))
      ));
      const listingsWithoutCoordinates = data.filter((listing) => !listingsWithCoordinates.includes(listing));
      console.log(
        `[BrowseListings] Coordinate coverage: total=${data.length}, withCoordinates=${listingsWithCoordinates.length}, withoutCoordinates=${listingsWithoutCoordinates.length}`,
      );
      console.log('[BrowseListings] Listings with coordinates:', listingsWithCoordinates.map((listing) => listing._id));
      console.log('[BrowseListings] Listings without coordinates:', listingsWithoutCoordinates.map((listing) => listing._id));
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
    <div className="page-shell"><Navbar /><div className="px-4 py-6">
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
      <div className="browse-toolbar"><div><button className={`view-toggle ${view === 'grid' ? 'selected' : ''}`} onClick={() => setView('grid')}>Grid View</button><button className={`view-toggle ${view === 'map' ? 'selected' : ''}`} onClick={() => setView('map')}>Map View</button></div><button className="button button-outline" onClick={locateUser}>Use my location</button>{userLocation && <label className="radius-control">Within {radius} km<input type="range" min="1" max="100" value={radius} onChange={(event) => setRadius(Number(event.target.value))} /></label>}</div>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading listings...</div>
      ) : visibleListings.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p>No listings found. Try adjusting your filters.</p>
        </div>
      ) : (
        view === 'map' ? <ListingsMap listings={visibleListings} /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div></div>
  );
}
