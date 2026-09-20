import { useEffect, useState } from 'react';
import { adminAPI } from '../api/admin.js';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [userData, listingData] = await Promise.all([adminAPI.getUsers(), adminAPI.getListings()]);
      setUsers(userData); setListings(listingData);
    } catch (requestError) { setError(requestError.message); }
  }
  useEffect(() => { load(); }, []);

  async function removeUser(id) {
    if (!window.confirm('Delete this user and their listings?')) return;
    try { await adminAPI.deleteUser(id); setUsers((current) => current.filter((user) => user._id !== id)); setListings((current) => current.filter((listing) => listing.createdBy?._id !== id)); } catch (requestError) { setError(requestError.message); }
  }
  async function removeListing(id) {
    if (!window.confirm('Delete this listing?')) return;
    try { await adminAPI.deleteListing(id); setListings((current) => current.filter((listing) => listing._id !== id)); } catch (requestError) { setError(requestError.message); }
  }

  return <main className="page-shell"><section className="admin-page"><p className="eyebrow">Moderation</p><h1>Admin dashboard</h1>{error && <p className="form-error">{error}</p>}<div className="admin-table-section"><h2>Users</h2><div className="admin-table">{users.map((user) => <div className="admin-row" key={user._id}><span><strong>{user.name}</strong><small>{user.email}{user.isAdmin ? ' · Admin' : ''}</small></span><button className="button button-outline" onClick={() => removeUser(user._id)}>Delete</button></div>)}</div></div><div className="admin-table-section"><h2>Listings</h2><div className="admin-table">{listings.map((listing) => <div className="admin-row" key={listing._id}><span><strong>{listing.title}</strong><small>By {listing.createdBy?.name || 'Unknown'} · {listing.location}</small></span><button className="button button-outline" onClick={() => removeListing(listing._id)}>Delete</button></div>)}</div></div></section></main>;
}
