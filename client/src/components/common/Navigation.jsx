import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    path: '/',
    label: 'Home',
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/explore',
    label: 'Explore',
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 3l7 4v10l-7 4-7-4V7l7-4zm0 5.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
      </svg>
    ),
  },
  {
    path: '/reels',
    label: 'Reels',
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M7 4h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zm3 4 6 6m-6 0 6-6" />
      </svg>
    ),
  },
  {
    path: '/messages',
    label: 'DM',
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M7 8h10m-10 4h6m-8 8 3.6-3H18a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11l1 2z" />
      </svg>
    ),
  },
  {
    path: '/profile/me',
    label: 'Profile',
    icon: (active) => (
      <svg className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0H5z" />
      </svg>
    ),
  },
];

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-[rgb(var(--color-border))] bg-white/94 px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex h-11 min-w-0 flex-1 items-center justify-center rounded-full px-2 transition ${
                active ? 'bg-black text-white' : 'text-[rgb(var(--color-text-soft))]'
              }`}
              aria-label={item.label}
            >
              {item.icon(active)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
