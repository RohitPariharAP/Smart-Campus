import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const linkStyles =
    "rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700";
  const mobileLinkStyles =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";

  const commonLinks = [
  
    { to: "/notes", label: "Notes" },
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

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <>
                {renderLinks(commonLinks)}
                {renderLinks(roleBasedLinks)}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-600 text-white focus:outline-none">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
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
                        Signed in as
                        <br />
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`${
                              active ? "bg-gray-100" : ""
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

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-3 space-y-1 bg-white text-gray-700 shadow-lg">
          {user ? (
            <>
              {renderLinks(commonLinks, true)}
              {renderLinks(roleBasedLinks, true)}

              <div className="px-4 py-2 text-sm border-t">
                Signed in as <br />
                <span className="font-medium">{user?.email}</span>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={mobileLinkStyles}>
                Login
              </Link>
              <Link to="/register" className={mobileLinkStyles}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
