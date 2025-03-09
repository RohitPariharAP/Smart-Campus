import { useAuth } from '../context/AuthContext';
import NotesGallery from '../components/NotesGallery';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';

export default function NotesPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Study Materials</h1>
          {user  && (
            <Link
              to="/upload-note"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload New Notes
            </Link>
          )}
        </div>
        
        {/* <SearchBar /> */}
        <NotesGallery />
      </div>
    </div>
  );
}