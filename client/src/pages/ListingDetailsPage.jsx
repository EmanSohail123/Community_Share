import { useParams } from 'react-router-dom';
import ListingDetails from '../components/ListingDetails';
import Navbar from '../components/Navbar.jsx';

export default function ListingDetailsPage() {
  return <main className="page-shell"><Navbar /><ListingDetails /></main>;
}
