import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { commentService, likeService, postService, saveService } from '../services';
import CommentSection from '../components/post/CommentSection';

const ReelCommentsOverlay = ({ reel, comments, commentsLoading, commentsError, onClose, onCommentsChange }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="hidden h-full w-full items-center justify-center p-6 lg:flex">
        <div className="grid h-[min(86vh,760px)] w-full max-w-6xl grid-cols-[minmax(0,1fr)_420px] overflow-hidden rounded-[32px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center bg-black">
            <video src={reel.video} className="h-full w-full object-contain" controls loop playsInline poster={reel.image} />
          </div>
          <div className="relative flex h-full flex-col bg-white">
            <button onClick={onClose} className="btn-ghost absolute right-4 top-4 h-10 w-10 rounded-full p-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="border-b border-[rgb(var(--color-border))] px-5 py-4 pr-14">
              <p className="text-sm font-semibold text-black">{reel.author?.username}</p>
              <p className="mt-1 text-xs text-[rgb(var(--color-text-soft))]">{reel.caption || 'Comments on this reel'}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {commentsLoading ? (
                <div className="py-10 text-sm text-[rgb(var(--color-text-soft))]">Loading comments...</div>
              ) : commentsError ? (
                <div className="py-10 text-sm text-red-600">{commentsError}</div>
              ) : (
                <CommentSection postId={reel._id} comments={comments} setComments={onCommentsChange} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-[32px] bg-white lg:hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[rgb(var(--color-border))] px-4 py-3">
          <div className="w-10" />
          <div className="h-1.5 w-12 rounded-full bg-[rgb(var(--color-border))]" />
          <button onClick={onClose} className="btn-ghost h-10 w-10 rounded-full p-0">
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
            <CommentSection postId={reel._id} comments={comments} setComments={onCommentsChange} />
          )}
        </div>
      </div>
    </div>
  );
};

const ReelCard = ({
  reel,
  isMuted,
  isLiked,
  isSaved,
  likesCount,
  onRegisterVideo,
  onToggleMute,
  onToggleLike,
  onToggleSave,
  onOpenComments,
}) => {
  const createdDate = reel.createdAt
    ? new Date(reel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <article className="snap-start shrink-0 h-[calc(100vh-8.5rem)] px-3 py-4 md:h-[calc(100vh-5.75rem)] md:px-6">
      <div className="relative h-full max-w-md mx-auto overflow-hidden rounded-[2rem] border border-[rgb(var(--color-border))] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <video
          ref={(node) => onRegisterVideo(reel._id, node)}
          src={reel.video}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          playsInline
          muted={isMuted}
          poster={reel.image}
          preload="metadata"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/65" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <div className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-black shadow-sm backdrop-blur-md">
            REELS
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="rounded-full bg-white/90 p-3 text-black shadow-sm backdrop-blur-md transition hover:bg-white"
            aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
          >
            {isMuted ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6M11 5 6 9H3v6h3l5 4V5Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5 6 9H3v6h3l5 4V5Zm5.536 2.464a5 5 0 0 1 0 7.072M19.364 4.636a9 9 0 0 1 0 12.728" />
              </svg>
            )}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-4 md:p-5">
          <div className="min-w-0 flex-1 text-white">
            <Link to={`/profile/${reel.author?.username}`} className="mb-3 flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-full border border-white/40 bg-white/30">
                {reel.author?.profileImage ? (
                  <img src={reel.author.profileImage} alt={reel.author.username} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase text-white">
                    {reel.author?.username?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{reel.author?.username || 'Unknown chef'}</p>
                <p className="text-xs text-white/75">{createdDate}</p>
              </div>
            </Link>

            {reel.caption && <p className="max-w-[22rem] text-sm leading-6 text-white/90 drop-shadow-sm">{reel.caption}</p>}
          </div>

          <div className="flex flex-col items-center gap-4 text-white">
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${
                isLiked ? 'bg-[rgb(var(--color-like))] text-white' : 'bg-white/92 text-black hover:bg-white'
              }`}
              aria-label={isLiked ? 'Unlike reel' : 'Like reel'}
            >
              <svg className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-white/85">{likesCount}</span>

            <button
              type="button"
              onClick={onOpenComments}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/92 text-black shadow-sm transition hover:bg-white"
              aria-label="Open comments"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-white/85">{reel.commentsCount || 0}</span>

            <button
              type="button"
              onClick={onToggleSave}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${
                isSaved ? 'bg-sky-100 text-[rgb(var(--color-primary))]' : 'bg-white/92 text-black hover:bg-white'
              }`}
              aria-label={isSaved ? 'Unsave reel' : 'Save reel'}
            >
              <svg className="h-6 w-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedIds, setLikedIds] = useState({});
  const [savedIds, setSavedIds] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [activeCommentsReel, setActiveCommentsReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const itemRefs = useRef({});

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await postService.getReels(1, 20);
        const nextReels = response.posts || [];
        setReels(nextReels);
        setLikeCounts(Object.fromEntries(nextReels.map((reel) => [reel._id, reel.likesCount || 0])));
      } catch (err) {
        setError(err.message || 'Failed to fetch reels');
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  useEffect(() => {
    if (reels.length === 0) return;

    let cancelled = false;

    const syncStatuses = async () => {
      try {
        const statuses = await Promise.all(
          reels.map(async (reel) => {
            const [likeResponse, saveResponse] = await Promise.all([
              likeService.checkIfLiked(reel._id),
              saveService.checkIfSaved(reel._id),
            ]);

            return {
              id: reel._id,
              liked: likeResponse?.isLiked || false,
              saved: saveResponse?.isSaved || false,
            };
          })
        );

        if (cancelled) return;
        setLikedIds(Object.fromEntries(statuses.map((item) => [item.id, item.liked])));
        setSavedIds(Object.fromEntries(statuses.map((item) => [item.id, item.saved])));
      } catch (statusError) {
        if (!cancelled) console.error('Error syncing reel status:', statusError);
      }
    };

    syncStatuses();
    return () => {
      cancelled = true;
    };
  }, [reels]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;
        const index = Number(visibleEntry.target.getAttribute('data-index'));
        if (!Number.isNaN(index)) setActiveIndex(index);
      },
      { root: container, threshold: [0.6, 0.75, 0.9] }
    );

    reels.forEach((reel) => {
      const node = itemRefs.current[reel._id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    reels.forEach((reel, index) => {
      const video = videoRefs.current[reel._id];
      if (!video) return;

      video.muted = isMuted;

      if (index === activeIndex) {
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex, isMuted, reels]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key) || reels.length === 0) return;
      event.preventDefault();
      const nextIndex = event.key === 'ArrowDown' ? Math.min(activeIndex + 1, reels.length - 1) : Math.max(activeIndex - 1, 0);
      itemRefs.current[reels[nextIndex]?._id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, reels]);

  const openComments = async (reel) => {
    setActiveCommentsReel(reel);
    setComments([]);
    setCommentsLoading(true);
    setCommentsError('');

    try {
      const response = await commentService.getComments(reel._id);
      setComments(response?.comments || []);
    } catch (err) {
      setCommentsError(err.message || 'Failed to load comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-4rem)] bg-[rgb(var(--color-app))] text-black md:-mx-0">
      {error && (
        <div className="mx-auto max-w-md px-4 pt-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="w-full max-w-md animate-pulse overflow-hidden rounded-[2rem] border border-[rgb(var(--color-border))] bg-white p-4 shadow-sm">
            <div className="mb-4 h-10 w-40 rounded-full bg-[rgb(var(--color-surface-muted))]" />
            <div className="h-[calc(100vh-18rem)] rounded-[1.5rem] bg-[rgb(var(--color-surface-muted))]" />
          </div>
        </div>
      ) : reels.length === 0 ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="max-w-md rounded-[2rem] border border-[rgb(var(--color-border))] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-[rgb(var(--color-primary))]">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-black">No reels yet</h2>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--color-text-soft))]">There are no reels to show right now.</p>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reels.map((reel, index) => (
            <div key={reel._id} ref={(node) => {
              if (node) itemRefs.current[reel._id] = node;
              else delete itemRefs.current[reel._id];
            }} data-index={index}>
              <ReelCard
                reel={reel}
                isMuted={isMuted}
                isLiked={likedIds[reel._id] || false}
                isSaved={savedIds[reel._id] || false}
                likesCount={likeCounts[reel._id] ?? reel.likesCount ?? 0}
                onRegisterVideo={(reelId, node) => {
                  if (node) videoRefs.current[reelId] = node;
                  else delete videoRefs.current[reelId];
                }}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                onToggleLike={async () => {
                  const currentlyLiked = likedIds[reel._id] || false;
                  setLikedIds((prev) => ({ ...prev, [reel._id]: !currentlyLiked }));
                  setLikeCounts((prev) => ({ ...prev, [reel._id]: Math.max(0, (prev[reel._id] ?? 0) + (currentlyLiked ? -1 : 1)) }));

                  try {
                    await likeService.toggleLike(reel._id);
                  } catch {
                    setLikedIds((prev) => ({ ...prev, [reel._id]: currentlyLiked }));
                    setLikeCounts((prev) => ({ ...prev, [reel._id]: Math.max(0, (prev[reel._id] ?? 0) + (currentlyLiked ? 1 : -1)) }));
                  }
                }}
                onToggleSave={async () => {
                  const currentlySaved = savedIds[reel._id] || false;
                  setSavedIds((prev) => ({ ...prev, [reel._id]: !currentlySaved }));

                  try {
                    await saveService.toggleSave(reel._id);
                  } catch {
                    setSavedIds((prev) => ({ ...prev, [reel._id]: currentlySaved }));
                  }
                }}
                onOpenComments={() => openComments(reel)}
              />
            </div>
          ))}
        </div>
      )}

      {activeCommentsReel && (
        <ReelCommentsOverlay
          reel={activeCommentsReel}
          comments={comments}
          commentsLoading={commentsLoading}
          commentsError={commentsError}
          onClose={() => {
            setActiveCommentsReel(null);
            setComments([]);
            setCommentsError('');
          }}
          onCommentsChange={(updatedComments) => {
            const safeComments = updatedComments || [];
            setComments(safeComments);
            setReels((prev) =>
              prev.map((reel) =>
                reel._id === activeCommentsReel._id
                  ? { ...reel, commentsCount: safeComments.length }
                  : reel
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default Reels;
