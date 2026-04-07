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

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await userService.searchUsers(searchQuery);
      setResults(response.users || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedQuery);
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

    if (results.length > 0) {
      checkFollowStatuses();
    }
  }, [results]);

  const handleFollowClick = async (userId) => {
    const isCurrentlyFollowing = followStates[userId] || false;
    const result = await toggleFollow(userId, isCurrentlyFollowing);

    if (result.success) {
      setFollowStates(prev => ({
        ...prev,
        [userId]: result.isFollowing
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-warmGray-900 tracking-tight mb-2">Search</h1>
        <p className="text-warmGray-600">Find and connect with recipe creators</p>
      </div>
      
      <div className="mb-10">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            className="input pl-12"
          />
          <svg 
            className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-warmGray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-warmGray-200 border-t-primary-500"></div>
          <div className="text-lg mt-4 text-warmGray-600 font-medium">Searching...</div>
        </div>
      )}

      {!loading && !query && (
        <div className="card text-center py-16 px-6">
          <svg className="w-24 h-24 mx-auto text-warmGray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-warmGray-900 mb-3">Find Recipe Creators</h2>
          <p className="text-warmGray-600 text-lg">Start typing to search for users to follow</p>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="card text-center py-16 px-6">
          <svg className="w-24 h-24 mx-auto text-warmGray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-warmGray-900 mb-3">No Users Found</h2>
          <p className="text-warmGray-600 text-lg">Try searching with a different username</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-warmGray-600 mb-6 font-medium">{results.length} user{results.length !== 1 ? 's' : ''} found</p>
          <div className="space-y-4">
            {results.map((user) => {
              const isFollowing = followStates[user._id] || false;

              return (
                <div key={user._id} className="card p-5 border border-cream-300 flex items-center gap-4 group flex-wrap sm:flex-nowrap">
                  <Link to={`/profile/${user.username}`}>
                    <div className="avatar w-16 h-16 text-xl transition-transform group-hover:scale-105">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user.username}`}>
                      <h3 className="font-semibold text-lg text-warmGray-900 hover:text-primary-600 transition-colors truncate">{user.username}</h3>
                    </Link>
                    {user.bio && <p className="text-sm text-warmGray-600 truncate mt-0.5">{user.bio}</p>}
                    <p className="text-xs text-warmGray-500 mt-2 flex items-center gap-3">
                      <span>{user.followersCount || 0} followers</span>
                      <span>·</span>
                      <span>{user.followingCount || 0} following</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to="/messages"
                      state={{
                        openConversation: {
                          userId: user._id,
                          username: user.username,
                          profileImage: user.profileImage
                        }
                      }}
                      className="px-4 py-2 rounded-full font-medium border border-cream-300 text-warmGray-700 hover:bg-cream-50 text-center flex-1 sm:flex-none"
                    >
                      Message
                    </Link>
                    <button
                      onClick={() => handleFollowClick(user._id)}
                      className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all active:scale-95 flex-1 sm:flex-none ${
                        isFollowing
                          ? 'btn-outline'
                          : 'btn-primary'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
