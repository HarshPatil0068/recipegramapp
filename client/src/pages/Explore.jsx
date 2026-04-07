import { useEffect, useState } from 'react';
import { postService } from '../services';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';

const Explore = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await postService.getTrendingPosts(20);
      setTrendingPosts(response.posts || []);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setError(error.message || 'Failed to fetch trending posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError('');
      const response = await postService.searchPosts(searchQuery, 1, 20);
      const [searching, setSearching] = useState(false);
      const [error, setError] = useState('');
      const [activeFilter, setActiveFilter] = useState('all');
      console.error('Error searching posts:', error);
      setError(error.message || 'Failed to search posts');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  const displayPosts = searchResults.length > 0 ? searchResults : trendingPosts;
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-warmGray-900 tracking-tight mb-2">Explore</h1>
        <p className="text-warmGray-600">Discover trending recipes and new ideas</p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search recipes by name or ingredients..."
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
          {isSearchActive ? (
            <button
              type="button"
              onClick={clearSearch}
              className="btn-outline rounded-full w-full sm:w-auto"
            >
              Clear
            </button>
          ) : (
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="btn-primary rounded-full w-full sm:w-auto"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="card bg-error-50 border-error-200 text-error-700 px-6 py-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p><strong>Error:</strong> {error}</p>
          </div>
        </div>
      )}

      {/* Section Title */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-warmGray-900">
          {isSearchActive ? `Search Results${searchResults.length > 0 ? ` (${searchResults.length})` : ''}` : 'Trending Recipes'}
        </h2>
        {!isSearchActive && (
          <p className="text-sm text-warmGray-600 mt-2">Most popular recipes from the community</p>
        )}
      </div>

      {/* Posts Grid */}
      {loading || searching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-warmGray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-warmGray-700 mb-2">
            {isSearchActive ? 'No recipes found' : 'No trending recipes yet'}
          </h3>
          <p className="text-warmGray-500 mb-4">
            {isSearchActive ? `No recipes match "${searchQuery}"` : 'Check back later for trending content'}
          </p>
          {isSearchActive && (
            <button
              onClick={clearSearch}
              className="btn-primary"
            >
              View All Trending
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
