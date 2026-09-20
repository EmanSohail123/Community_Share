import { Link, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import BrowseListingsPage from './pages/BrowseListingsPage.jsx';
import ListingDetailsPage from './pages/ListingDetailsPage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import Navbar from './components/Navbar.jsx';
import { useSocket } from './context/SocketContext.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

function Brand() {
  return <Link className="brand" to="/">Community<span>Share</span></Link>;
}

function Landing() {
  const { token } = useAuth();
  return (
    <main className="landing page-shell">
      <Navbar />
      <section className="hero">
        <div className="hero-copy reveal">
          <p className="eyebrow"><span className="eyebrow-dot" /> A better way to neighbor</p>
          <h1>Good things are <em>closer</em> than you think.</h1>
          <p className="hero-text">Borrow the drill. Find a dog walker. Learn a new skill. CommunityShare makes it easy to trade the useful, everyday things that make a neighborhood feel like home.</p>
          <div className="hero-actions"><Link className="button button-coral" to={token ? '/dashboard' : '/signup'}>{token ? 'Go to your dashboard' : 'Join your neighborhood'} <span aria-hidden="true">↗</span></Link><a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="hero-art reveal delay-one" aria-label="Illustration of neighbors sharing items">
          <div className="sun" /><div className="art-label">Shared nearby <strong>12 items</strong></div>
          <div className="house house-one" /><div className="house house-two" /><div className="person person-one" /><div className="person person-two" /><div className="bike" /><div className="plant" />
        </div>
      </section>
      <section className="trust-row"><span>Made for real neighborhoods</span><span className="trust-line" /><span>Private by default</span><span className="trust-line" /><span>Built on trust</span></section>
      <section id="how-it-works" className="how-section"><div><p className="eyebrow">Three small steps</p><h2>Share more. <em>Need</em> less.</h2></div><div className="steps"><article><b>01</b><h3>Make an offer</h3><p>List a tool, skill, or helping hand you can share.</p></article><article><b>02</b><h3>Find nearby</h3><p>Discover useful things from people around the corner.</p></article><article><b>03</b><h3>Pass it on</h3><p>Keep good stuff moving through your community.</p></article></div></section>
    </main>
  );
}

function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await (isLogin ? login({ email: form.email, password: form.password }) : register(form)); navigate('/dashboard'); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return <main className="auth-page"><div className="auth-visual"><Brand /><div><p className="eyebrow">Your corner of the neighborhood</p><h1>Useful things,<br /><em>shared freely.</em></h1><p>Community is not a feed. It is a favor, a borrowed ladder, a hello on the sidewalk.</p></div><span className="visual-note">Neighbors helping neighbors since today.</span></div><section className="auth-panel"><Link className="mobile-brand" to="/"><Brand /></Link><div className="auth-form"><p className="eyebrow">{isLogin ? 'Welcome back' : 'Start close to home'}</p><h2>{isLogin ? 'Log in to CommunityShare' : 'Join your local circle'}</h2><p className="form-intro">{isLogin ? 'Pick up where you left off.' : 'Create an account and see what is being shared nearby.'}</p><form onSubmit={handleSubmit}>{!isLogin && <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jamie Rivera" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label><label>Password<div className="password-field"><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8 characters minimum" /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 4 10 7-.4 1.2-1.3 2.5-2.5 3.6M6.2 6.2C4.5 7.3 3.3 8.9 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></svg>}</button></div></label>{error && <p className="form-error">{error}</p>}<button className="button button-coral submit-button" disabled={loading}>{loading ? 'One moment...' : isLogin ? 'Log in' : 'Create account'} <span aria-hidden="true">↗</span></button></form><p className="switch-auth">{isLogin ? "Don't have an account?" : 'Already have an account?'} <Link to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Sign up' : 'Log in'}</Link></p></div></section></main>;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  return <main className="dashboard page-shell"><section className="dashboard-content"><p className="eyebrow"><span className="eyebrow-dot" /> Your neighborhood, at a glance</p><h1>Good to see you, <em>{user?.name?.split(' ')[0] || 'neighbor'}.</em></h1><p className="dashboard-lede">Your community is waiting just around the corner.</p><div className="dashboard-grid"><div className="empty-state"><span className="empty-icon">＋</span><h2>Your dashboard is ready.</h2><p>Next up: share something useful or discover what your neighbors have on hand.</p><button className="button button-dark" onClick={() => navigate('/listings')}>Browse nearby <span aria-hidden="true">↗</span></button></div><aside><p className="eyebrow">Your details</p><div className="profile-line"><span className="avatar">{user?.name?.charAt(0)}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div><div className="profile-meta"><span>Location</span><strong>{user?.location || 'Not set yet'}</strong></div><div className="profile-meta"><span>Member since</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</strong></div></aside></div></section></main>;
}

export default function App() { return <Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} /><Route path="/listings" element={<BrowseListingsPage />} /><Route path="/listings/:id" element={<ListingDetailsPage />} /><Route path="/profiles/:userId" element={<UserProfilePage />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/create-listing" element={<CreateListingPage />} /><Route path="/my-listings" element={<MyListingsPage />} /><Route path="/messages/:conversationId?" element={<MessagesPage />} /><Route path="/admin" element={<AdminDashboardPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>; }
