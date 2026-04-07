import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce, useFollow } from '../hooks';
import { userService, followService } from '../services';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followStates, setFollowStates] = useState({});
  const debouncedQuery = useDebounce(query, 500);
  const { toggleFollow } = useFollow();

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await userService.searchUsers(debouncedQuery);
        setResults(response.users || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    const checkFollowStatuses = async () => {
      try {
        const entries = await Promise.all(
          results.map(async (user) => {
            try {
              const response = await followService.checkIfFollowing(user._id);
              return [user._id, response?.isFollowing || false];
            } catch (error) {
              console.error('Error checking follow status:', error);
              return [user._id, false];
            }
          })
        );
        setFollowStates(Object.fromEntries(entries));
      } catch (error) {
        console.error('Error checking follow statuses:', error);
      }
    };

    if (results.length > 0) checkFollowStatuses();
  }, [results]);

  return (
    <div className="page-shell max-w-3xl">
      <div className="ig-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Search</p>
        <h1 className="mt-1 text-3xl font-extrabold text-black">Find your food people</h1>
        <div className="relative mt-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="input pl-12"
          />
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--color-text-faint))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-primary))]" />
          <p className="mt-4 text-sm font-medium text-[rgb(var(--color-text-soft))]">Searching creators...</p>
        </div>
      )}

      {!loading && !query && (
        <div className="ig-card mt-5 p-10 text-center">
          <h2 className="text-2xl font-bold text-black">Start typing to search</h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Find creators, open their profile, follow them, or jump straight into messages.</p>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="ig-card mt-5 p-10 text-center">
          <h2 className="text-2xl font-bold text-black">No users found</h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Try another spelling or search for a different username.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-5 space-y-4">
          {results.map((user) => {
            const isFollowing = followStates[user._id] || false;
            return (
              <div key={user._id} className="ig-card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <Link to={`/profile/${user.username}`} className="story-ring shrink-0">
                  <div className="story-ring-inner">
                    <div className="avatar h-16 w-16 text-xl">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        user.username.charAt(0)
                      )}
                    </div>
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${user.username}`} className="block truncate text-base font-bold text-black">
                    {user.username}
                  </Link>
                  <p className="mt-1 truncate text-sm text-[rgb(var(--color-text-soft))]">{user.bio || 'Food creator'}</p>
                  <p className="mt-2 text-xs font-medium text-[rgb(var(--color-text-faint))]">
                    {user.followersCount || 0} followers · {user.followingCount || 0} following
                  </p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  <Link
                    to="/messages"
                    state={{ openConversation: { userId: user._id, username: user.username, profileImage: user.profileImage } }}
                    className="btn-outline flex-1 rounded-full sm:flex-none"
                  >
                    Message
                  </Link>
                  <button
                    onClick={async () => {
                      const result = await toggleFollow(user._id, isFollowing);
                      if (result.success) {
                        setFollowStates((prev) => ({ ...prev, [user._id]: result.isFollowing }));
                      }
                    }}
                    className={`${isFollowing ? 'btn-outline' : 'btn-primary'} flex-1 rounded-full sm:flex-none`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search;
