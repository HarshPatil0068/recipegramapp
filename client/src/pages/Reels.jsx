import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { likeService, postService, saveService } from '../services';

const ReelCard = ({ reel, isMuted, isLiked, isSaved, likesCount, onRegisterVideo, onToggleMute, onToggleLike, onToggleSave }) => {
  const createdDate = reel.createdAt
    ? new Date(reel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <article className="snap-start shrink-0 h-[calc(100vh-8.5rem)] md:h-[calc(100vh-5.5rem)] px-3 md:px-6 py-3 md:py-5">
      <div className="relative h-full max-w-md mx-auto overflow-hidden rounded-[2rem] border border-cream-300 bg-cream-100 shadow-[0_18px_50px_rgba(74,69,67,0.14)]">
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

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <div className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-warmGray-800 shadow-sm backdrop-blur-md">
            REELS
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className="rounded-full bg-white/90 p-3 text-warmGray-800 shadow-sm backdrop-blur-md transition hover:bg-white"
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

            {reel.caption && (
              <p className="max-w-[22rem] text-sm leading-6 text-white/90 drop-shadow-sm">
                {reel.caption}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 text-white">
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${
                isLiked ? 'bg-primary-500 text-white' : 'bg-white/90 text-warmGray-800 hover:bg-white'
              }`}
              aria-label={isLiked ? 'Unlike reel' : 'Like reel'}
            >
              <svg className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />
              </svg>
            </button>
            <span className="text-xs font-semibold text-white/85">{likesCount}</span>

            <Link
              to={`/post/${reel._id}`}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-warmGray-800 shadow-sm transition hover:bg-white"
              aria-label="Open comments"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <span className="text-xs font-semibold text-white/85">{reel.commentsCount || 0}</span>

            <button
              type="button"
              onClick={onToggleSave}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${
                isSaved ? 'bg-primary-200 text-primary-800' : 'bg-white/90 text-warmGray-800 hover:bg-white'
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
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const itemRefs = useRef({});

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

  useEffect(() => {
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

  const registerVideo = (reelId, node) => {
    if (node) videoRefs.current[reelId] = node;
    else delete videoRefs.current[reelId];
  };

  const registerItem = (reelId, node) => {
    if (node) itemRefs.current[reelId] = node;
    else delete itemRefs.current[reelId];
  };

  const handleToggleLike = async (reelId) => {
    const currentlyLiked = likedIds[reelId] || false;
    setLikedIds((prev) => ({ ...prev, [reelId]: !currentlyLiked }));
    setLikeCounts((prev) => ({ ...prev, [reelId]: Math.max(0, (prev[reelId] ?? 0) + (currentlyLiked ? -1 : 1)) }));

    try {
      await likeService.toggleLike(reelId);
    } catch {
      setLikedIds((prev) => ({ ...prev, [reelId]: currentlyLiked }));
      setLikeCounts((prev) => ({ ...prev, [reelId]: Math.max(0, (prev[reelId] ?? 0) + (currentlyLiked ? 1 : -1)) }));
    }
  };

  const handleToggleSave = async (reelId) => {
    const currentlySaved = savedIds[reelId] || false;
    setSavedIds((prev) => ({ ...prev, [reelId]: !currentlySaved }));

    try {
      await saveService.toggleSave(reelId);
    } catch {
      setSavedIds((prev) => ({ ...prev, [reelId]: currentlySaved }));
    }
  };

  return (
    <div className="-mx-4 md:-mx-0 -mt-4 min-h-[calc(100vh-4rem)] bg-cream-50 text-warmGray-900">
      {error && (
        <div className="mx-auto max-w-md px-4 pt-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="w-full max-w-md animate-pulse overflow-hidden rounded-[2rem] border border-cream-300 bg-white p-4 shadow-sm">
            <div className="mb-4 h-10 w-40 rounded-full bg-cream-200" />
            <div className="h-[calc(100vh-18rem)] rounded-[1.5rem] bg-cream-200" />
          </div>
        </div>
      ) : reels.length === 0 ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <div className="max-w-md rounded-[2rem] border border-cream-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-warmGray-900">No reels yet</h2>
            <p className="mt-3 text-sm leading-6 text-warmGray-600">There are no reels to show right now.</p>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="h-[calc(100vh-4rem)] overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reels.map((reel, index) => (
            <div key={reel._id} ref={(node) => registerItem(reel._id, node)} data-index={index}>
              <ReelCard
                reel={reel}
                isMuted={isMuted}
                isLiked={likedIds[reel._id] || false}
                isSaved={savedIds[reel._id] || false}
                likesCount={likeCounts[reel._id] ?? reel.likesCount ?? 0}
                onRegisterVideo={registerVideo}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                onToggleLike={() => handleToggleLike(reel._id)}
                onToggleSave={() => handleToggleSave(reel._id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reels;