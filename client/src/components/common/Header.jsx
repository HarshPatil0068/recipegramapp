import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isActivePath = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-300 bg-cream-50/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 border border-primary-200">
              <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-warmGray-900 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              RecipeGram
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath('/') 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-warmGray-700 hover:bg-cream-100 hover:text-warmGray-900'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/explore" 
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath('/explore') 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-warmGray-700 hover:bg-cream-100 hover:text-warmGray-900'
                  }`}
                >
                  Explore
                </Link>
                <Link
                  to="/reels"
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath('/reels')
                      ? 'bg-primary-100 text-primary-800'
                      : 'text-warmGray-700 hover:bg-cream-100 hover:text-warmGray-900'
                  }`}
                >
                  Reels
                </Link>
                <Link 
                  to="/search" 
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath('/search') 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-warmGray-700 hover:bg-cream-100 hover:text-warmGray-900'
                  }`}
                >
                  Search
                </Link>
                <Link 
                  to="/messages" 
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActivePath('/messages') 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'text-warmGray-700 hover:bg-cream-100 hover:text-warmGray-900'
                  }`}
                >
                  Messages
                </Link>
                <div className="w-px h-6 bg-cream-300 mx-1" />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-warmGray-700 hover:bg-cream-100 transition-colors"
                  >
                    <div className="avatar w-8 h-8 text-xs">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.username} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user?.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden lg:inline">{user?.username || 'Account'}</span>
                    <svg className="w-4 h-4 text-warmGray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 card p-2 z-50">
                      <Link
                        to="/profile/me"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-warmGray-700 hover:bg-warmGray-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/saved"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm text-warmGray-700 hover:bg-warmGray-50"
                      >
                        Saved Recipes
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-error-600 hover:bg-error-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-warmGray-700 hover:text-warmGray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary rounded-full"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
