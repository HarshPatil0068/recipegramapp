import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserStart, fetchUserSuccess, fetchUserFailure } from '../store/slices/userSlice';
import { userService, followService } from '../services';
import { useFollow } from '../hooks';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/user/EditProfileModal';

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toggleFollow } = useFollow();

  useEffect(() => {
    const fetchProfile = async () => {
      if (username === 'me' && !currentUser?.username) return;

      try {
        dispatch(fetchUserStart());
        const targetUsername = username === 'me' ? currentUser?.username : username;
        if (!targetUsername) {
          dispatch(fetchUserFailure('User not found'));
          return;
        }

        const response = await userService.getUserProfile(targetUsername);
        dispatch(fetchUserSuccess(response));
        const postsResponse = await userService.getUserPosts(response._id);
        setPosts(Array.isArray(postsResponse?.posts) ? postsResponse.posts : []);
      } catch (error) {
        dispatch(fetchUserFailure(error.message));
      }
    };

    if (username) fetchProfile();
  }, [username, currentUser, dispatch]);

  const isOwnProfile = currentUser?.username === profile?.username;

  useEffect(() => {
    if (!isOwnProfile && profile?._id) {
      const checkFollowStatus = async () => {
        try {
          const response = await followService.checkIfFollowing(profile._id);
          setIsFollowing(response?.isFollowing || false);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      };
      checkFollowStatus();
    }
  }, [profile?._id, isOwnProfile]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[70vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-primary))]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <div className="ig-card p-10 text-center">
          <h1 className="text-2xl font-bold text-black">User not found</h1>
          <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">This profile doesn&apos;t exist or is unavailable.</p>
          <Link to="/search" className="btn-primary mt-6 rounded-full px-6">
            Search creators
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="ig-card p-6 md:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="mx-auto md:mx-0">
            <div className="story-ring">
              <div className="story-ring-inner">
                <div className="avatar h-28 w-28 text-4xl md:h-40 md:w-40">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.username} className="h-full w-full object-cover" />
                  ) : (
                    profile.username.charAt(0)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <h1 className="text-3xl font-light text-black">{profile.username}</h1>
              {isOwnProfile ? (
                <button onClick={() => setIsEditModalOpen(true)} className="btn-outline rounded-full px-5">
                  Edit profile
                </button>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      const result = await toggleFollow(profile._id, isFollowing);
                      if (result.success) setIsFollowing(result.isFollowing);
                    }}
                    className={`${isFollowing ? 'btn-outline' : 'btn-primary'} rounded-full px-5`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    to="/messages"
                    state={{ openConversation: { userId: profile._id, username: profile.username, profileImage: profile.profileImage } }}
                    className="btn-outline rounded-full px-5"
                  >
                    Message
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="stats-chip"><span className="font-bold text-black">{posts.length}</span> posts</div>
              <div className="stats-chip"><span className="font-bold text-black">{profile.followersCount || 0}</span> followers</div>
              <div className="stats-chip"><span className="font-bold text-black">{profile.followingCount || 0}</span> following</div>
            </div>

            <div className="mt-6 max-w-2xl">
              <p className="text-base font-semibold text-black">{profile.name || profile.username}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[rgb(var(--color-text-soft))]">
                {profile.bio || 'No bio yet. This profile is all about the posts.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-[0.22em] text-[rgb(var(--color-text-soft))]">Posts</h2>
          <span className="text-sm text-[rgb(var(--color-text-faint))]">{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          <div className="ig-card p-10 text-center">
            <h3 className="text-2xl font-bold text-black">{isOwnProfile ? 'Share your first post' : 'No posts yet'}</h3>
            <p className="mt-2 text-sm text-[rgb(var(--color-text-soft))]">
              {isOwnProfile ? 'Your grid is empty right now. Start with a plated photo or a reel.' : 'Check back later for new recipes and reels.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>

      {isEditModalOpen && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} currentProfile={profile} />
      )}
    </div>
  );
};

export default Profile;
