import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BellIcon,
  UserPlusIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count
  const location = useLocation();

  // Handle navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Link styles
  const linkStyles =
    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700";
  const mobileLinkStyles =
    "flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors";
  const activeLinkStyles = "bg-gray-700";

  // Get current path for active links
  const currentPath = location.pathname;

  // Base/common links with icons
  const commonLinks = [
    { to: "/", label: "Home", icon: <HomeIcon className="h-5 w-5 mr-2" /> },
    {
      to: "/notes",
      label: "Notes",
      icon: <DocumentTextIcon className="h-5 w-5 mr-2" />,
    },
  ];

  // Role-based links with icons
  const getRoleBasedLinks = () => {
    if (user?.role === "student") {
      return [
        {
          to: "/my-attendance",
          label: "My Attendance",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />,
        },
        {
          to: "/dashboard",
          label: "Dashboard",
          icon: <ChartBarIcon className="h-5 w-5 mr-2" />,
        },
      ];
    } else if (user?.role === "teacher") {
      return [
        {
          to: "/mark-attendance",
          label: "Mark Attendance",
          icon: <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />,
        },
        {
          to: "dashboard",
          label: "Dashboard",
          icon: <ChartBarIcon className="h-5 w-5 mr-2" />,
        },
        {
          to: "/teacher-history",
          label: "Records",
          icon: <AcademicCapIcon className="h-5 w-5 mr-2" />,
        },
        // Registration dropdown will be handled separately
      ];
    } else if (user?.role === "admin") {
      return [
        {
          to: "/admin-dashboard",
          label: "Dashboard",
          icon: <ChartBarIcon className="h-5 w-5 mr-2" />,
        },
        {
          to: "/admin-attendance",
          label: "Records",
          icon: <AcademicCapIcon className="h-5 w-5 mr-2" />,
        },
      ];
    }
    return [];
  };

  const roleBasedLinks = getRoleBasedLinks();

  // Render links with active state
  const renderLinks = (links, isMobile = false) =>
    links.map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className={`${isMobile ? mobileLinkStyles : linkStyles} ${
          currentPath === link.to
            ? isMobile
              ? "bg-gray-100"
              : activeLinkStyles
            : ""
        }`}
        onClick={() => isMobile && setMobileMenuOpen(false)}
      >
        {link.icon}
        {link.label}
      </Link>
    ));

  // Registration dropdown for teachers
  const RegistrationDropdown = ({ isMobile = false }) => {
    // Only show registration options for teachers
    if (user?.role !== "teacher") return null;

    return (
      <Menu as="div" className={isMobile ? "w-full" : "relative"}>
        <Menu.Button
          className={`${
            isMobile ? mobileLinkStyles : linkStyles
          } ${
            currentPath.includes("/register")
              ? isMobile
                ? "bg-gray-100"
                : activeLinkStyles
              : ""
          } justify-between w-full`}
        >
          <span className="flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Registration
          </span>
          <svg
            className="h-4 w-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={`${
              isMobile
                ? "relative mt-1 mb-2 w-full"
                : "absolute right-0 mt-1 w-48 origin-top-right"
            } bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
          >
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/register/student"
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } flex items-center px-4 py-2 text-sm`}
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Student Registration
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/register/teacher"
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } flex items-center px-4 py-2 text-sm`}
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Teacher Registration
                  </Link>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 text-white transition-all duration-300 ${
        scrolled
          ? "bg-gray-900 shadow-lg"
          : "bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center text-xl font-bold hover:text-gray-300 transition-colors"
            >
              <span className="text-blue-400 mr-1">Smart</span>
              <span>Campus</span>
              
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <>
                {renderLinks(commonLinks)}
                {renderLinks(roleBasedLinks)}
                <RegistrationDropdown />

                {/* Notifications */}
                <Menu as="div" className="relative">
                  <Menu.Button className="relative rounded-full p-1 text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <BellIcon className="h-6 w-6" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notifications}
                      </span>
                    )}
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium">Notifications</h3>
                      </div>
                      {notifications > 0 ? (
                        <>
                          <Menu.Item>
                            <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                              <p className="text-sm text-gray-700">
                                New course materials uploaded
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                10 minutes ago
                              </p>
                            </div>
                          </Menu.Item>
                          <Menu.Item>
                            <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                              <p className="text-sm text-gray-700">
                                Your attendance record was updated
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                1 hour ago
                              </p>
                            </div>
                          </Menu.Item>
                          <Menu.Item>
                            <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                              <p className="text-sm text-gray-700">
                                System maintenance scheduled
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Yesterday
                              </p>
                            </div>
                          </Menu.Item>
                          <Menu.Item>
                            <Link
                              to="/notifications"
                              className="block px-4 py-2 text-xs text-center text-blue-600 hover:bg-gray-50"
                            >
                              View all notifications
                            </Link>
                          </Menu.Item>
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>

                {/* User Profile Menu */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-900">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b">
                        <p className="font-medium">{user?.name || "User"}</p>
                        <p className="text-xs truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {user?.role || "User"}
                        </p>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            Profile Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center w-full px-4 py-2 text-sm text-red-600 text-left`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${linkStyles} hover:text-blue-300`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={mobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="md:hidden p-2 bg-white text-gray-700 shadow-lg divide-y divide-gray-100">
          {user ? (
            <>
              <div className="flex items-center px-4 py-3 mb-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                </div>
                <div className="ml-3 truncate">
                  <div className="text-base font-medium">
                    {user?.name || "User"}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user?.email}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role || "User"}
                  </div>
                </div>
              </div>
              <div className="py-2">
                {renderLinks(commonLinks, true)}
                {renderLinks(roleBasedLinks, true)}
                <RegistrationDropdown isMobile={true} />
                <Link
                  to="/notifications"
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BellIcon className="h-5 w-5 mr-2" />
                  Notifications
                  {notifications > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {notifications}
                    </span>
                  )}
                </Link>
              </div>
              <div className="pt-2">
                <Link
                  to="/profile"
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="px-2 pt-2 pb-3 space-y-1">
              {renderLinks(commonLinks, true)}
              <Link
                to="/login"
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </Transition>
    </nav>
  );
}