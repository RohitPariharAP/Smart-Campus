import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
 
 

export default function Navbar() {
  const { user, logout } = useAuth();

  // Common link styles
  const linkStyles = "rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700";
  const mobileLinkStyles = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";

  // Teacher-specific links
  const teacherLinks = [
    { to: "/mark-attendance", label: "Mark Attendance" },
    { to: "/register/student", label: "Register Student" },
    { to: "/register/teacher", label: "Register Teacher" },
  ];

  // Common links for authenticated users
  const authenticatedLinks = [
    { to: "/notes", label: "Notes" },
    { to: "/attendance", label: "Attendance" },
  ];

  return (
    <nav className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold hover:text-gray-300">
              Smart Campus
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  {authenticatedLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={linkStyles}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {user.role === "teacher" && teacherLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={linkStyles}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* User Menu */}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button 
                      className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      aria-label="User menu"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
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
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Signed in as<br/>
                          <span className="font-medium">{user?.email}</span>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={logout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full px-4 py-2 text-sm text-gray-700 text-left`}
                            >
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
                  <Link to="/login" className={linkStyles}>
                    Login
                  </Link>
                  <Link to="/register" className={linkStyles}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Menu as="div" className="relative">
              <Menu.Button 
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
                aria-label="Open menu"
              >
                {user ? (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {user ? (
                    <>
                      {authenticatedLinks.map((link) => (
                        <Menu.Item key={link.to}>
                          <Link
                            to={link.to}
                            className={mobileLinkStyles}
                          >
                            {link.label}
                          </Link>
                        </Menu.Item>
                      ))}

                      {user.role === "teacher" && teacherLinks.map((link) => (
                        <Menu.Item key={link.to}>
                          <Link
                            to={link.to}
                            className={mobileLinkStyles}
                          >
                            {link.label}
                          </Link>
                        </Menu.Item>
                      ))}

                      <div className="px-4 py-2 text-sm text-gray-700 border-t">
                        Signed in as<br/>
                        <span className="font-medium">{user?.email}</span>
                      </div>

                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block w-full px-4 py-2 text-sm text-gray-700 text-left`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        <Link
                          to="/login"
                          className={mobileLinkStyles}
                        >
                          Login
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <Link
                          to="/register"
                          className={mobileLinkStyles}
                        >
                          Register
                        </Link>
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}