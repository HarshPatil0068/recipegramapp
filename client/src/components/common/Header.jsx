import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks';
import { getPreferredTheme, persistTheme } from '../../utils/theme';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => getPreferredTheme());
  const userMenuRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Explore' },
    { path: '/ai-chef', label: 'AI Chef' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    persistTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[rgb(var(--color-border))] bg-white/88 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 via-pink-400 to-fuchsia-500 text-sm font-extrabold text-white shadow-sm">
                RG
              </div>
              <div className="min-w-0">
                <div className="logo-script text-[2rem] text-black">RecipeGram</div>
              </div>
            </Link>

            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-6">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative py-2 text-sm font-semibold transition ${
                        isActive ? 'text-black' : 'text-[rgb(var(--color-text-soft))] hover:text-black'
                      }`}
                    >
                      {item.label}
                      {isActive && <span className="absolute inset-x-0 -bottom-[9px] mx-auto h-0.5 w-full rounded-full bg-black" />}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/search"
                  className="hidden md:flex items-center gap-2 rounded-full bg-[rgb(var(--color-app))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-soft))] transition hover:bg-[rgb(var(--color-surface-muted))] hover:text-black"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search creators
                </Link>

                <Link to="/reels" className="hidden md:inline-flex btn-ghost rounded-full px-3">
                  Reels
                </Link>

                <Link to="/messages" className="hidden xl:inline-flex btn-ghost rounded-full px-3">
                  Messages
                </Link>

                <Link to="/saved" className="hidden xl:inline-flex btn-ghost rounded-full px-3">
                  Saved
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full bg-white px-1 py-1 pr-2 transition hover:bg-[rgb(var(--color-app))]"
                  >
                    <div className="avatar h-9 w-9 text-xs">
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-semibold text-black">
                      {user?.username || 'Account'}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-[rgb(var(--color-border))] bg-white p-2 shadow-xl">
                      <Link
                        to="/profile/me"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-black hover:bg-[rgb(var(--color-surface-muted))]"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          toggleTheme();
                        }}
                        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-black hover:bg-[rgb(var(--color-surface-muted))]"
                      >
                        Switch to {theme === 'light' ? 'dark' : 'light'} mode
                      </button>
                      <Link
                        to="/saved"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-black hover:bg-[rgb(var(--color-surface-muted))]"
                      >
                        Saved posts
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[rgb(var(--color-error))] hover:bg-red-50"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary rounded-full">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
