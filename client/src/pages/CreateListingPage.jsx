import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ListingForm from '../components/ListingForm';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 mb-4">You need to be logged in to create a listing</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <ListingForm
        onSuccess={() => navigate('/my-listings')}
      />
    </div>
  );
}
