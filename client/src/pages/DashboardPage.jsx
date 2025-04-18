import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {user?.name} ({user?.role})
          </h1>
          <p className="text-gray-600 mt-2">
            Access your academic resources and records
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Access Cards */}
          <Link
            to="/notes"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Study Materials</h2>
            <p className="text-gray-600">Access course notes and resources</p>
          </Link>

           

          {user?.role === 'teacher' && (
            <Link
              to="/mark-attendance"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
              <p className="text-gray-600">Record daily student attendance</p>
            </Link>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <p className="text-gray-600">No recent activity</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Notes Uploaded</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
            </div>
          </div>
        </div>

        {user?.role === 'teacher' && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Account Management</h2>
            <div className="flex gap-4">
              <Link
                to="/register/student"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Register New Student
              </Link>
              <Link
                to="/register/teacher"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Register New Teacher
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
