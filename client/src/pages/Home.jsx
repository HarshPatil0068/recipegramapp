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
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-5 space-y-4">
        <div className="card px-4 py-3 flex items-center justify-between border border-cream-300 bg-white">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-warmGray-900">Home</h1>
            <p className="text-xs text-warmGray-500 mt-0.5">Recipes and reels from your network</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary rounded-full px-5 py-2 text-sm"
          >
            Create
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="card bg-red-50 border border-red-200 px-6 py-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-900">Error Loading Feed</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && safePosts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : safePosts.length === 0 ? (
          /* Empty State */
          <div className="card text-center py-14 px-8 border border-cream-300 bg-white">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-cream-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-warmGray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-warmGray-900 mb-3">Feed is empty</h2>
            <p className="text-warmGray-600 mb-2 max-w-md mx-auto leading-relaxed">
              Start following users to see their delicious recipes and updates here.
            </p>
            <p className="text-warmGray-500 text-sm mb-7 max-w-md mx-auto">
              Or create your own recipe post to inspire others!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary rounded-full px-8"
              >
                Share Your Recipe
              </button>
              <Link
                to="/explore"
                className="btn-outline rounded-full px-8 text-center"
              >
                Explore Recipes
              </Link>
            </div>
          </div>
        ) : (
          /* Posts List */
          <div className="space-y-4">
            {safePosts.map((post) => (
              <PostCard key={post?._id} post={post} />
            ))}
            {loading && (
              <div className="space-y-4">
                <PostCardSkeleton />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Home;
