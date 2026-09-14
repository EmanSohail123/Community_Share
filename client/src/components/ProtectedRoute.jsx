import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';

export default function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();
  return token ? <><Navbar /><Outlet /></> : <Navigate to="/login" replace state={{ from: location }} />;
}
