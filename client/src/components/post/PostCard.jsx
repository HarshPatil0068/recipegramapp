import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { likeService, saveService, commentService } from '../../services';
import CommentSection from './CommentSection';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
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

  useEffect(() => {
    document.body.style.overflow = showCommentsModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCommentsModal]);

  const handleCommentsChange = (updatedComments) => {
    const safeUpdated = updatedComments || [];
    setComments(safeUpdated);
    setCommentsCount(safeUpdated.length);
  };

  const openCommentsModal = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowCommentsModal(true);
    setCommentsLoading(true);
    setCommentsError('');

    try {
      const response = await commentService.getComments(post._id);
      const fetchedComments = response?.comments || [];
      setComments(fetchedComments);
      setCommentsCount(fetchedComments.length);
    } catch (error) {
      setCommentsError(error.message || 'Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);

    try {
      await likeService.toggleLike(post._id);
      setLikesCount((prev) => prev + (isLiked ? -1 : 1));
      setIsLiked((prev) => !prev);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await saveService.toggleSave(post._id);
      setIsSaved((prev) => !prev);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <>
      <article className="ig-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4">
          <Link to={`/profile/${post.author?.username}`} className="flex min-w-0 items-center gap-3">
            <div className="story-ring">
              <div className="story-ring-inner">
                <div className="avatar h-10 w-10 text-sm">
                  {post.author?.profileImage ? (
                    <img src={post.author.profileImage} alt={post.author.username} className="h-full w-full object-cover" />
                  ) : (
                    post.author?.username?.charAt(0) || '?'
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-black">{post.author?.username || 'Unknown chef'}</p>
              <p className="truncate text-xs text-[rgb(var(--color-text-soft))]">
                {post.author?.followersCount || 0} followers
              </p>
            </div>
          </Link>

          <button className="btn-ghost h-9 w-9 rounded-full p-0" title="More options">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
            </svg>
          </button>
        </div>

        <div className="relative bg-[rgb(var(--color-app))]">
          <Link to={`/post/${post._id}`} className="block">
            {post.postType === 'reel' && post.video ? (
              <video src={post.video} className="aspect-square w-full object-cover md:aspect-[4/5]" muted loop autoPlay playsInline poster={post.image} />
            ) : (
              <img src={post.image} alt={post.caption} className="aspect-square w-full object-cover md:aspect-[4/5]" loading="lazy" />
            )}
          </Link>

          <div className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
            {post.postType === 'reel' ? 'Reel' : 'Recipe'}
          </div>

          {showLikeAnimation && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg className="h-24 w-24 animate-ping text-[rgb(var(--color-like))]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleLike} className={`transition ${isLiked ? 'text-[rgb(var(--color-like))]' : 'text-black hover:opacity-60'}`} title="Like">
                <svg className="h-7 w-7" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button onClick={openCommentsModal} className="text-black transition hover:opacity-60" title="Comment">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <Link to={`/post/${post._id}`} className="text-black transition hover:opacity-60" title="Share">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12l16-8-7 16-2-6-7-2z" />
                </svg>
              </Link>
            </div>

            <button onClick={handleSave} className={`transition ${isSaved ? 'text-[rgb(var(--color-primary))]' : 'text-black hover:opacity-60'}`} title="Save">
              <svg className="h-7 w-7" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {likesCount > 0 && <p className="text-sm font-bold text-black">{likesCount.toLocaleString()} likes</p>}

          {post.caption && (
            <p className="text-sm leading-6 text-[rgb(var(--color-text))]">
              <Link to={`/profile/${post.author?.username}`} className="mr-2 font-bold text-black">
                {post.author?.username}
              </Link>
              <span>{post.caption}</span>
            </p>
          )}

          {commentsCount > 0 && (
            <button onClick={openCommentsModal} className="text-sm font-medium text-[rgb(var(--color-text-soft))]">
              View all {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}

          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[rgb(var(--color-text-faint))]">
            {formatDate(post.createdAt)}
          </p>
        </div>
      </article>

      {showCommentsModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" onClick={() => setShowCommentsModal(false)}>
          <div className="hidden h-full w-full items-center justify-center p-6 md:flex">
            <div className="grid max-h-[88vh] w-full max-w-6xl grid-cols-2 overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center bg-black">
                {post.postType === 'reel' && post.video ? (
                  <video src={post.video} className="h-full w-full object-contain" controls loop playsInline />
                ) : (
                  <img src={post.image} alt={post.caption} className="h-full w-full object-contain" />
                )}
              </div>
              <div className="relative overflow-y-auto p-5">
                <button onClick={() => setShowCommentsModal(false)} className="btn-ghost absolute right-4 top-4 h-10 w-10 rounded-full p-0">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="mb-4 pr-12">
                  <h3 className="text-lg font-bold text-black">Comments</h3>
                  <p className="mt-1 text-sm text-[rgb(var(--color-text-soft))]">@{post.author?.username}</p>
                </div>
                {commentsLoading ? (
                  <div className="py-10 text-sm text-[rgb(var(--color-text-soft))]">Loading comments...</div>
                ) : commentsError ? (
                  <div className="py-10 text-sm text-red-600">{commentsError}</div>
                ) : (
                  <CommentSection postId={post._id} comments={comments} setComments={handleCommentsChange} />
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-[32px] bg-white md:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] px-4 py-3">
              <div className="w-10" />
              <div className="h-1.5 w-12 rounded-full bg-[rgb(var(--color-border))]" />
              <button onClick={() => setShowCommentsModal(false)} className="btn-ghost h-10 w-10 rounded-full p-0">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[calc(82vh-58px)] overflow-y-auto px-4 pb-4">
              {commentsLoading ? (
                <div className="py-10 text-sm text-[rgb(var(--color-text-soft))]">Loading comments...</div>
              ) : commentsError ? (
                <div className="py-10 text-sm text-red-600">{commentsError}</div>
              ) : (
                <CommentSection postId={post._id} comments={comments} setComments={handleCommentsChange} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
