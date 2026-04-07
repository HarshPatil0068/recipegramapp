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
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await saveService.getSavedPosts(page, 12);
        setPosts(response.posts || []);
        setTotalPages(response.totalPages || 1);
      } catch (fetchError) {
        console.error('Error fetching saved posts:', fetchError);
        setError(fetchError.message || 'Failed to fetch saved posts');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [page]);

  if (loading && page === 1) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-primary))]" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Saved</p>
          <h1 className="mt-1 text-3xl font-extrabold text-black">Your saved collection</h1>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Everything you bookmarked for later inspiration.</p>
        </div>
        <div className="stats-chip"><span className="font-bold text-black">{posts.length}</span> on this page</div>
      </div>

      {error && <div className="mb-5 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {posts.length === 0 ? (
        <div className="ig-card p-10 text-center">
          <h2 className="text-2xl font-bold text-black">No saved posts yet</h2>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">Tap the bookmark icon on any post to build your own recipe vault.</p>
          <Link to="/explore" className="btn-primary mt-6 rounded-full px-6">
            Discover posts
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="btn-outline rounded-full px-5 disabled:opacity-50">
                Previous
              </button>
              <span className="text-sm font-medium text-[rgb(var(--color-text-soft))]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="btn-outline rounded-full px-5 disabled:opacity-50">
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
