import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotesGallery from '../components/NotesGallery';
import { Link } from 'react-router-dom';
import { FiUpload, FiBookOpen, FiInfo, FiTrendingUp, FiStar, FiClock } from 'react-icons/fi';
import UploadNote from '../components/UploadNote'; // Import the upload component

export default function NotesPage() {
  const { user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Stats data (can be fetched from API in a real implementation)
  const stats = {
    totalNotes: 138,
    totalDownloads: 1247,
    yourUploads: user ? 5 : 0
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // In a real implementation, this would pass filters to the NotesGallery
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Study Materials Library</h1>
              <p className="text-blue-100 max-w-xl">
                Access and share quality study materials with your peers. Find notes, documents, and resources for all your academic needs.
              </p>
            </div>
            
            {user && (
              <div>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="px-6 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium shadow-sm"
                >
                  {showUpload ? (
                    <>
                      <FiBookOpen size={18} />
                      View Notes
                    </>
                  ) : (
                    <>
                      <FiUpload size={18} />
                      Upload New Notes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 ">
        <div className="bg-white rounded-t-xl shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          <div className="p-6 text-center ">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiBookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalNotes}</h3>
            <p className="text-gray-500">Total Study Materials</p>
          </div>
          
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalDownloads}</h3>
            <p className="text-gray-500">Total Downloads</p>
          </div>
          
          <div className="p-6 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FiUpload className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{stats.yourUploads}</h3>
            <p className="text-gray-500">{user ? 'Your Uploads' : 'User Uploads'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {!user && (
          <div className="mb-8 flex items-center gap-3 p-4 border bg-yellow-50 border-yellow-200 rounded-lg text-yellow-800">
            <FiInfo className="flex-shrink-0 h-5 w-5" />
            <p>
              <Link to="/login" className="font-medium underline">Log in</Link> or <Link to="/signup" className="font-medium underline">sign up</Link> to upload your own study materials and track your downloads.
            </p>
          </div>
        )}

        {showUpload && user ? (
          <div className="mb-12">
            <UploadNote />
          </div>
        ) : (
          <>
            {/* Tabs Navigation */}
            <div className="mb-8 border-b">
              <div className="flex overflow-x-auto space-x-8">
                <button 
                  onClick={() => handleTabChange('all')}
                  className={`pb-4 font-medium flex items-center gap-2 ${
                    activeTab === 'all' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiBookOpen size={18} />
                  All Notes
                </button>
                
                <button 
                  onClick={() => handleTabChange('popular')}
                  className={`pb-4 font-medium flex items-center gap-2 ${
                    activeTab === 'popular' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiStar size={18} />
                  Popular
                </button>
                
                <button 
                  onClick={() => handleTabChange('recent')}
                  className={`pb-4 font-medium flex items-center gap-2 ${
                    activeTab === 'recent' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FiClock size={18} />
                  Recent
                </button>
                
                {user && (
                  <button 
                    onClick={() => handleTabChange('myUploads')}
                    className={`pb-4 font-medium flex items-center gap-2 ${
                      activeTab === 'myUploads' 
                        ? 'border-b-2 border-blue-600 text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiUpload size={18} />
                    My Uploads
                  </button>
                )}
              </div>
            </div>
            
            {/* Notes Gallery Component */}
            <NotesGallery 
              filterType={activeTab} 
              userId={activeTab === 'myUploads' ? user?.id : null}
            />
          </>
        )}
      </div>
    </div>
  );
}