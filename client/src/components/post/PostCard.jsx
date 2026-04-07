import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { likeService, saveService } from '../../services';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  useEffect(() => {
    // Check if the current user has liked and saved this post
    const checkStatus = async () => {
      try {
        const [likeResponse, saveResponse] = await Promise.all([
          likeService.checkIfLiked(post._id),
          saveService.checkIfSaved(post._id),
        ]);
        setIsLiked(likeResponse?.data?.isLiked || likeResponse?.isLiked || false);
        setIsSaved(saveResponse?.data?.isSaved || saveResponse?.isSaved || false);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };
    checkStatus();
  }, [post._id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show animation
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);

    try {
      await likeService.toggleLike(post._id);
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await saveService.toggleSave(post._id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <article className="card group overflow-hidden border border-cream-300 bg-cream-100 animate-fade-in">
      {/* Post Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-cream-300">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {post.author?.profileImage ? (
              <img 
                src={post.author.profileImage} 
                alt={post.author.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold">
                {post.author?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-warmGray-900 text-sm">{post.author?.username}</p>
            {post.author?.followersCount !== undefined && (
              <p className="text-xs text-warmGray-500">
                {post.author.followersCount} {post.author.followersCount === 1 ? 'follower' : 'followers'}
              </p>
            )}
          </div>
        </Link>
        
        {/* More options button */}
        <button className="p-2 text-warmGray-500 hover:text-warmGray-700 rounded-full transition-colors" title="More options">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Post Media with Badge */}
      <div className="relative overflow-hidden bg-warmGray-100">
        <Link to={`/post/${post._id}`} className="block relative group/media">
          {post.postType === 'reel' && post.video ? (
            <video
              src={post.video}
              className="w-full max-h-[36rem] object-cover"
              muted
              loop
              autoPlay
              playsInline
              poster={post.image}
            />
          ) : (
            <img
              src={post.image}
              alt={post.caption}
              className="w-full max-h-[36rem] object-cover"
              loading="lazy"
            />
          )}
          
          {/* Post Type Badge */}
          <div className="absolute top-3 right-3 bg-black/65 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white text-[11px] font-medium">
            {post.postType === 'reel' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                </svg>
                Reel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Recipe
              </>
            )}
          </div>

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Like Animation */}
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-ping">
              <svg className="w-20 h-20 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button 
              onClick={handleLike}
              className={`p-2 rounded-full transition-all duration-200 active:scale-90 ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-warmGray-700 hover:text-red-500'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <Link 
              to={`/post/${post._id}`} 
              className="p-2 text-warmGray-700 hover:text-primary-600 rounded-full transition-colors" 
              title="Comment"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <button className="p-2 text-warmGray-700 hover:text-primary-600 rounded-full transition-colors" title="Share">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
          <button 
            onClick={handleSave}
            className={`p-2 rounded-full transition-all duration-200 active:scale-90 ${
              isSaved 
                ? 'text-primary-700' 
                : 'text-warmGray-700 hover:text-primary-700'
            }`}
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Likes Count */}
        {likesCount > 0 && (
          <div className="text-sm font-semibold text-warmGray-900">
            <span>
              {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
            </span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="text-sm leading-relaxed">
            <Link to={`/profile/${post.author?.username}`} className="font-semibold text-warmGray-900 hover:text-primary-700 transition-colors">
              {post.author?.username}
            </Link>
            {' '}
            <span className="text-warmGray-700">{post.caption}</span>
          </div>
        )}

        {/* Comments Count */}
        {post.commentsCount > 0 && (
          <Link 
            to={`/post/${post._id}`} 
            className="inline-block text-sm text-warmGray-500 hover:text-warmGray-700 transition-colors font-medium"
          >
            View all {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
          </Link>
        )}

        {/* Timestamp */}
        {post.createdAt && (
          <p className="text-xs text-warmGray-400 uppercase tracking-wide font-medium">
            {new Date(post.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}
      </div>
    </article>
  );
};

export default PostCard;
