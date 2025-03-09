import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Card({ title, description, buttonText, buttonLink, bgColor }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {buttonText && buttonLink && (
        <Link
          to={buttonLink}
          className={`inline-block px-6 py-3 text-white rounded-lg hover:opacity-90 ${bgColor}`}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Smart Campus
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card
            title="For Students"
            description="Access study materials, view attendance, and collaborate with peers."
            buttonText={!user ? "Get Started" : "Go to Dashboard"}
            buttonLink={!user ? "/register" : "/dashboard"}
            bgColor="bg-blue-600"
          />
          <Card
            title="For Teachers"
            description="Manage student attendance, upload materials, and track progress."
            buttonText={!user ? "Teacher Registration" : "Go to Teacher Panel"}
            buttonLink={!user ? "/register" : "/teacher-dashboard"}
            bgColor="bg-green-600"
          />
        </div>
      </div>
    </div>
  );
}
