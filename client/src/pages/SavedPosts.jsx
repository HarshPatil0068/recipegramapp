import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { saveService } from '../services';
import PostCard from '../components/post/PostCard';

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedPosts();
  }, [page]);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await saveService.getSavedPosts(page, 12);
      setPosts(response.posts || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      setError(error.message || 'Failed to fetch saved posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream-300 border-t-primary-500 mb-4"></div>
          <div className="text-xl text-warmGray-600">Loading saved posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h1 className="text-2xl md:text-3xl font-semibold text-warmGray-900">Saved Posts</h1>
        </div>
        <p className="text-warmGray-600 sm:ml-11">Your collection of saved recipes ({posts.length} {posts.length === 1 ? 'recipe' : 'recipes'})</p>
      </div>

      {error && (
        <div className="card bg-error-50 border-error-200 text-error-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <div className="mb-4">
            <svg className="w-24 h-24 mx-auto text-warmGray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-warmGray-700 mb-2">No Saved Posts Yet</h2>
          <p className="text-warmGray-500 mb-6 max-w-md mx-auto">Save recipes you love by clicking the bookmark icon on any post to view them here later</p>
          <Link
            to="/explore"
            className="inline-block btn-primary"
          >
            Discover Recipes
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                  className="px-4 py-2 bg-warmGray-200 rounded-full text-warmGray-800 hover:bg-warmGray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-warmGray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-warmGray-200 rounded-full text-warmGray-800 hover:bg-warmGray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedPosts;
