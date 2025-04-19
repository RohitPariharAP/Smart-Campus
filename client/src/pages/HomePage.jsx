import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  BellAlertIcon 
} from '@heroicons/react/24/outline';

function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function RoleCard({ title, description, buttonText, buttonLink, bgColor, icon, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100"
    >
      <div className={`inline-flex p-3 ${bgColor} bg-opacity-10 rounded-full mb-4`}>
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {buttonText && buttonLink && (
        <Link
          to={buttonLink}
          className={`inline-block px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all ${bgColor} hover:shadow-md`}
        >
          {buttonText}
        </Link>
      )}
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);

  // Simulated announcements data (in a real app, this would come from an API)
  useEffect(() => {
    // Simulate API call
    const mockAnnouncements = [
      { id: 1, title: "End of Semester Exams", message: "Final exams begin on May 15th", date: "2025-04-15" },
      { id: 2, title: "Campus Maintenance", message: "Library will be closed on April 22nd", date: "2025-04-10" },
      { id: 3, title: "New Course Registration", message: "Registration for summer courses opens May 1st", date: "2025-04-05" }
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const features = [
    { 
      icon: <BookOpenIcon className="h-6 w-6" />, 
      title: "Smart Notes", 
      description: "Access and collaborate on lecture notes and study materials."
    },
    { 
      icon: <CalendarIcon className="h-6 w-6" />, 
      title: "Attendance Tracking", 
      description: "Simple attendance management for students and teachers."
    },
    { 
      icon: <ChartBarIcon className="h-6 w-6" />, 
      title: "Progress Analytics", 
      description: "Visual dashboards to track academic progress and metrics."
    },
    { 
      icon: <BellAlertIcon className="h-6 w-6" />, 
      title: "Instant Notifications", 
      description: "Stay updated with important announcements and deadlines."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Welcome to Smart Campus
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              The intelligent platform for modern education management
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Link>
                <Link to="/learn-more" className="btn-secondary px-8 py-3 rounded-lg font-medium border-2 border-white hover:bg-white hover:bg-opacity-10 transition-all">
                  Learn More
                </Link>
              </div>
            )}
            
            {user && (
              <Link to={user.role === "student" || "teacher" ? "/dashboard" : `/${user.role}-dashboard`} className="btn-primary bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all">
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Smart Features for Modern Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform simplifies campus management with intuitive tools for both students and educators.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.2 * index}
            />
          ))}
        </div>
      </div>

      {/* Role-based Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <RoleCard
            title="For Students"
            description="Access study materials, track your attendance, and manage your academic journey with ease."
            buttonText={!user ? "Student Registration" : "Go to Dashboard"}
            buttonLink={!user ? "/register?role=student" : "/dashboard"}
            bgColor="bg-blue-600"
            icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
            delay={0.2}
          />
          <RoleCard
            title="For Teachers"
            description="Manage student attendance, upload materials, and track student progress efficiently."
            buttonText={!user ? "Teacher Registration" : "Teacher Dashboard"}
            buttonLink={!user ? "/register?role=teacher" : "/dashboard"}
            bgColor="bg-green-600"
            icon={<AcademicCapIcon className="h-6 w-6 text-green-600" />}
            delay={0.3}
          />
          <RoleCard
            title="For Administrators"
            description="Oversee campus activities, manage users, and access comprehensive analytics."
            buttonText={!user ? "Admin Access" : "Admin Dashboard"}
            buttonLink={!user ? "/contact-admin" : "/dashboard"}
            bgColor="bg-purple-600"
            icon={<ChartBarIcon className="h-6 w-6 text-purple-600" />}
            delay={0.4}
          />
        </div>
      </div>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BellAlertIcon className="h-6 w-6 text-blue-600 mr-2" />
              Latest Announcements
            </h2>
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{announcement.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to="/announcements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Announcements →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gray-900 text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your campus experience?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of students and educators already using Smart Campus to improve productivity and collaboration.
            </p>
            {!user ? (
              <Link to="/register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Get Started Now
              </Link>
            ) : (
              <Link to="/invite" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Invite Colleagues
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}