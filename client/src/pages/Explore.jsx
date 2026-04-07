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
    const fetchTrendingPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await postService.getTrendingPosts(20);
        setTrendingPosts(response.posts || []);
      } catch (fetchError) {
        console.error('Error fetching trending posts:', fetchError);
        setError(fetchError.message || 'Failed to fetch trending posts');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError('');
      const response = await postService.searchPosts(searchQuery, 1, 20);
      setSearchResults(response.posts || []);
    } catch (searchError) {
      console.error('Error searching posts:', searchError);
      setError(searchError.message || 'Failed to search posts');
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
    <div className="page-shell">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Explore</p>
          <h1 className="mt-1 text-3xl font-extrabold text-black">Trending recipes and reels</h1>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Browse what the community is saving, liking, and replaying.</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, captions, ingredients..."
            className="input flex-1"
          />
          {isSearchActive ? (
            <button type="button" onClick={clearSearch} className="btn-outline rounded-full px-5">
              Clear
            </button>
          ) : (
            <button type="submit" disabled={searching || !searchQuery.trim()} className="btn-primary rounded-full px-5">
              {searching ? 'Searching...' : 'Search'}
            </button>
          )}
        </form>
      </div>

      {error && <div className="mb-5 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {loading || searching ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <PostCardSkeleton key={item} />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <div className="ig-card p-10 text-center">
          <h2 className="text-2xl font-bold text-black">{isSearchActive ? 'No recipes found' : 'Nothing trending yet'}</h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">
            {isSearchActive ? `No results for "${searchQuery}".` : 'Check back soon for community favorites.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displayPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
