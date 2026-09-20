import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

function Brand() {
  return <Link className="brand" to="/">Community<span>Share</span></Link>;
}

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();
  const isBrowsePage = location.pathname === '/listings';

  return <nav className={`topbar ${isBrowsePage ? '' : 'topbar-padded'}`}><Brand /><div className="nav-links">{token ? <><Link to="/dashboard" className="text-link">Dashboard</Link><Link to="/listings" className="text-link">Browse</Link><Link to="/create-listing" className="text-link">Create</Link><Link to="/my-listings" className="text-link">My Listings</Link><Link to="/messages" className="text-link messages-link">Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</Link>{user?.isAdmin && <Link to="/admin" className="text-link">Admin</Link>}<button className="button button-outline" onClick={logout}>Log out</button></> : <><a href="#how-it-works">How it works</a><Link className="button button-dark" to="/login">Log in <span aria-hidden="true">↗</span></Link></>}</div></nav>;
}
