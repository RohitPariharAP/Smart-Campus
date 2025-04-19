// DashboardPage.jsx
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
  CalendarIcon,
  UserPlusIcon,
  AcademicCapIcon,
  BellAlertIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Dashboard Card Component
function DashboardCard({ title, description, icon, to, bgColor = "bg-blue-600", bgLight = "bg-blue-50" }) {
  return (
    <Link
      to={to}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200 group"
    >
      <div className={`inline-flex p-3 ${bgLight} rounded-full mb-4 group-hover:scale-110 transition-transform`}>
        <div className={`${bgColor} rounded-full p-2 text-white`}>
          {icon}
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

// Stat Card Component
function StatCard({ value, label, icon, bgColor = "bg-blue-50", textColor = "text-blue-600" }) {
  return (
    <div className={`${bgColor} rounded-xl p-4 flex items-center`}>
      <div className={`p-3 rounded-full ${textColor} mr-4`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ title, description, time, icon }) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500">
        {time}
      </div>
    </div>
  );
}

// Dashboard Page Component
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notesUploaded: 0,
    attendance: 0,
    courses: 0,
    notifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch data (mock implementation)
  useEffect(() => {
    // In a real application, these would be API calls
    if (user) {
      // Mock stats based on user role
      if (user.role === 'student') {
        setStats({
          notesUploaded: 5,
          attendance: 92,
          courses: 4,
          notifications: 3
        });
      } else if (user.role === 'teacher') {
        setStats({
          notesUploaded: 12,
          attendance: 98,
          courses: 3,
          notifications: 5
        });
      } else if (user.role === 'admin') {
        setStats({
          notesUploaded: 24,
          attendance: 95,
          courses: 8,
          notifications: 7
        });
      }

      // Mock recent activity
      setRecentActivity([
        {
          title: "Attendance Marked",
          description: "Your attendance was recorded for Database Systems",
          time: "2 hours ago",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
        },
        {
          title: "New Note Added",
          description: "A new lecture note was uploaded to Advanced Algorithms",
          time: "Yesterday",
          icon: <DocumentTextIcon className="h-5 w-5 text-blue-500" />
        },
        {
          title: "Assignment Submission",
          description: "You submitted your Data Structures assignment",
          time: "3 days ago",
          icon: <BookOpenIcon className="h-5 w-5 text-purple-500" />
        }
      ]);

      // Mock upcoming events
      setUpcomingEvents([
        {
          title: "Database Systems Midterm",
          date: "April 25, 2025",
          time: "10:00 AM - 12:00 PM"
        },
        {
          title: "Web Development Workshop",
          date: "April 28, 2025",
          time: "2:00 PM - 4:00 PM"
        },
        {
          title: "Academic Advising Session",
          date: "May 2, 2025",
          time: "11:00 AM - 12:00 PM"
        }
      ]);
    }
  }, [user]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get dashboard cards based on user role
  const getDashboardCards = () => {
    const commonCards = [
      {
        title: "Study Materials",
        description: "Access course notes and resources",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        to: "/notes",
        bgColor: "bg-blue-600",
        bgLight: "bg-blue-50"
      }
    ];

    if (user?.role === 'student') {
      return [
        ...commonCards,
        {
          title: "My Attendance",
          description: "View your attendance records",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
          to: "/my-attendance",
          bgColor: "bg-green-600",
          bgLight: "bg-green-50"
        },
        {
          title: "My Courses",
          description: "Access enrolled courses",
          icon: <AcademicCapIcon className="h-5 w-5" />,
          to: "/my-courses",
          bgColor: "bg-purple-600",
          bgLight: "bg-purple-50"
        },
        {
          title: "Course Calendar",
          description: "View class schedule and deadlines",
          icon: <CalendarIcon className="h-5 w-5" />,
          to: "/calendar",
          bgColor: "bg-amber-600",
          bgLight: "bg-amber-50"
        }
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...commonCards,
        {
          title: "Mark Attendance",
          description: "Record daily student attendance",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
          to: "/mark-attendance",
          bgColor: "bg-green-600",
          bgLight: "bg-green-50"
        },
        {
          title: "Attendance History",
          description: "View past attendance records",
          icon: <ChartBarIcon className="h-5 w-5" />,
          to: "/teacher-history",
          bgColor: "bg-indigo-600",
          bgLight: "bg-indigo-50"
        },
        {
          title: "Manage Courses",
          description: "Update course materials and settings",
          icon: <AcademicCapIcon className="h-5 w-5" />,
          to: "/manage-courses",
          bgColor: "bg-purple-600",
          bgLight: "bg-purple-50"
        }
      ];
    } else if (user?.role === 'admin') {
      return [
        {
          title: "Dashboard",
          description: "View campus analytics and metrics",
          icon: <ChartBarIcon className="h-5 w-5" />,
          to: "/admin-dashboard",
          bgColor: "bg-blue-600",
          bgLight: "bg-blue-50"
        },
        {
          title: "Attendance Records",
          description: "View all attendance statistics",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
          to: "/admin-attendance",
          bgColor: "bg-green-600",
          bgLight: "bg-green-50"
        },
        {
          title: "User Management",
          description: "Manage students and faculty accounts",
          icon: <UserGroupIcon className="h-5 w-5" />,
          to: "/manage-users",
          bgColor: "bg-purple-600",
          bgLight: "bg-purple-50"
        },
        {
          title: "System Settings",
          description: "Configure system preferences",
          icon: <CogIcon className="h-5 w-5" />,
          to: "/system-settings",
          bgColor: "bg-slate-600",
          bgLight: "bg-slate-50"
        }
      ];
    }
    
    return commonCards;
  };

  // Get stat cards based on user role
  const getStatCards = () => {
    const commonStats = [
      {
        value: stats.notesUploaded,
        label: "Notes Accessed",
        icon: <DocumentTextIcon className="h-6 w-6" />,
        bgColor: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        value: `${stats.attendance}%`,
        label: "Attendance Rate",
        icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
        bgColor: "bg-green-50",
        textColor: "text-green-600"
      }
    ];

    if (user?.role === 'student') {
      return [
        ...commonStats,
        {
          value: stats.courses,
          label: "Active Courses",
          icon: <AcademicCapIcon className="h-6 w-6" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600"
        },
        {
          value: stats.notifications,
          label: "New Notifications",
          icon: <BellAlertIcon className="h-6 w-6" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600"
        }
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...commonStats,
        {
          value: stats.courses,
          label: "Courses Teaching",
          icon: <AcademicCapIcon className="h-6 w-6" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600"
        },
        {
          value: stats.notifications,
          label: "Pending Actions",
          icon: <BellAlertIcon className="h-6 w-6" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600"
        }
      ];
    } else if (user?.role === 'admin') {
      return [
        {
          value: "425",
          label: "Total Students",
          icon: <UserGroupIcon className="h-6 w-6" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-600"
        },
        {
          value: "32",
          label: "Faculty Members",
          icon: <AcademicCapIcon className="h-6 w-6" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-600"
        },
        {
          value: `${stats.attendance}%`,
          label: "Overall Attendance",
          icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
          bgColor: "bg-green-50",
          textColor: "text-green-600"
        },
        {
          value: stats.notifications,
          label: "System Alerts",
          icon: <BellAlertIcon className="h-6 w-6" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600"
        }
      ];
    }
    
    return commonStats;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {getGreeting()}, {user?.name}
              </h1>
              <p className="text-blue-100 mt-2 capitalize">
                {user?.role} Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/profile" 
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getDashboardCards().map((card, index) => (
              <DashboardCard 
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                to={card.to}
                bgColor={card.bgColor}
                bgLight={card.bgLight}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Statistics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStatCards().map((stat, index) => (
              <StatCard
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                bgColor={stat.bgColor}
                textColor={stat.textColor}
              />
            ))}
          </div>
        </div>

        {/* Activity and Events Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="divide-y divide-gray-100">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    icon={activity.icon}
                  />
                ))
              ) : (
                <p className="text-gray-600 py-4">No recent activity to display</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/activity" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Activity →
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    <p className="text-xs text-gray-500">{event.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No upcoming events</p>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/calendar" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Full Calendar →
              </Link>
            </div>
          </div>
        </div>

        {/* User Management Section (for teachers and admins) */}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
              User Management
            </h2>
            <div className="flex flex-wrap gap-4">
              {user?.role === 'teacher' && (
                <>
                  <Link
                    to="/register/student"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Register New Student
                  </Link>
                  <Link
                    to="/manage-students"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Manage Students
                  </Link>
                </>
              )}
              
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/register/student"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Register New Student
                  </Link>
                  <Link
                    to="/register/teacher"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Register New Teacher
                  </Link>
                  <Link
                    to="/manage-users"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Manage All Users
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}