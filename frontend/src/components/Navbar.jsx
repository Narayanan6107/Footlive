import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, Bell, LogOut } from 'lucide-react';

const Navbar = () => {
  const [username, setUsername] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    setUsername(null);
    setShowMenu(false);
    navigate('/login');
  };

  return (
    <nav className="bg-black text-white border-b border-[#222] sticky top-0 z-50 backdrop-blur-xl bg-opacity-95">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center pr-6">
              <img src="/src/assets/logo.png" alt="Footlive" className="h-18 w-auto mr-2" />
            </Link>
          </div>

          <div className="flex items-center justify-end flex-1 space-x-6">
            {/* Main Nav Tabs - Moved to the right */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-2">
                <Link to="/" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-[#1a1a1a]">
                  Home
                </Link>
                <Link to="/news" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-[#1a1a1a]">
                  News
                </Link>
                <Link to="/standings" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-[#1a1a1a]">
                  Standings
                </Link>
                <Link to="/tools" className="text-gray-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors hover:bg-[#1a1a1a]">
                  Tools
                </Link>
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-4 border-l border-[#333] pl-6 ml-6">
              <button className="text-gray-400 hover:text-white p-2 rounded-full transition-colors hover:bg-[#1a1a1a]">
                <Bell size={20} />
              </button>

              {/* Auth Section */}
              {username ? (
                // Logged In User Menu
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 p-2 rounded-full transition-colors hover:bg-[#1a1a1a]"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-bold">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-gray-400 max-w-[100px] truncate">
                      {username}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[#333] bg-black/50">
                        <p className="text-sm font-bold text-white">{username}</p>
                        <p className="text-xs text-gray-400">Tactical Manager</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={16} className="text-white" />
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left border-t border-[#333]"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Logged Out - Login Link
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white p-2 rounded-full transition-colors hidden md:block hover:bg-[#1a1a1a]"
                >
                  <User size={20} />
                </Link>
              )}

              <button className="text-gray-400 hover:text-white p-2 rounded-full transition-colors md:hidden hover:bg-[#1a1a1a]">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
