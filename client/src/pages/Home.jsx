import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as hooks from '../hooks';
import PostCard from '../components/post/PostCard';
import PostCardSkeleton from '../components/common/PostCardSkeleton';
import CreatePostModal from '../components/post/CreatePostModal';

const Home = () => {
  const feedState = useSelector((state) => state.feed);
  const postsState = useSelector((state) => state.posts);
  const hasFeedSlice = Boolean(feedState);
  const feedPosts = hasFeedSlice ? feedState.feedPosts : postsState?.posts;
  const loading = hasFeedSlice ? feedState.loading : postsState?.loading;
  const error = hasFeedSlice ? feedState.error : postsState?.error;

  const feedHook = typeof hooks.useFeed === 'function' ? hooks.useFeed() : null;
  const fetchFeed = feedHook?.fetchFeed;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safePosts = Array.isArray(feedPosts) ? feedPosts : [];

  useEffect(() => {
    if (hasFeedSlice && typeof fetchFeed === 'function') {
      fetchFeed(1, true);
    }
  }, [fetchFeed, hasFeedSlice]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-[640px] space-y-5">
        <div className="ig-card px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Home</p>
              <h1 className="mt-1 text-2xl font-extrabold text-black">Create posts</h1>
              <p className="mt-1 text-sm text-[rgb(var(--color-text-soft))]">Share a recipe photo or reel with your people.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary rounded-full px-5">
              Create
            </button>
          </div>
        </div>

        {error && (
          <div className="ig-card flex items-start gap-3 border-red-200 bg-red-50 p-4 text-red-700">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Couldn&apos;t load your feed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading && safePosts.length === 0 ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <PostCardSkeleton key={item} />
            ))}
          </div>
        ) : safePosts.length === 0 ? (
          <div className="ig-card p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--color-surface-muted))]">
              <svg className="h-10 w-10 text-[rgb(var(--color-text-soft))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black">Your feed is still preheating</h2>
            <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">
              Follow more creators or drop your first recipe so the timeline starts feeling alive.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={() => setIsModalOpen(true)} className="btn-primary rounded-full px-6">
                Share a recipe
              </button>
              <Link to="/explore" className="btn-outline rounded-full px-6">
                Explore posts
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {safePosts.map((post) => (
              <PostCard key={post?._id} post={post} />
            ))}
            {loading && <PostCardSkeleton />}
          </div>
        )}
      </div>

      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Home;
