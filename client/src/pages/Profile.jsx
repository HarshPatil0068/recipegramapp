import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserStart, fetchUserSuccess, fetchUserFailure } from '../store/slices/userSlice';
import { userService, followService } from '../services';
import { useFollow } from '../hooks';
import PostCard from '../components/post/PostCard';
import EditProfileModal from '../components/user/EditProfileModal';

const Profile = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { profile, userPosts, loading } = useSelector((state) => state.user);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toggleFollow } = useFollow();

  useEffect(() => {
    const fetchProfile = async () => {
      // Handle /profile/me alias - wait for current user before requesting.
      if (username === 'me' && !currentUser?.username) {
        return;
      }

      try {
        dispatch(fetchUserStart());

        // Resolve /profile/me to the logged-in username.
        const targetUsername = username === 'me' ? currentUser?.username : username;

        if (!targetUsername) {
          dispatch(fetchUserFailure('User not found'));
          return;
        }

        const response = await userService.getUserProfile(targetUsername);
        dispatch(fetchUserSuccess(response));

        // Fetch user's posts
        const postsResponse = await userService.getUserPosts(response._id);
        setPosts(Array.isArray(postsResponse?.posts) ? postsResponse.posts : []);
      } catch (error) {
        dispatch(fetchUserFailure(error.message));
      }
    };

    if (username) {
      fetchProfile();
    }
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

  const handleFollow = async () => {
    const result = await toggleFollow(profile._id, isFollowing);
    if (result.success) {
      setIsFollowing(result.isFollowing);
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream-300 border-t-primary-500 mb-4"></div>
          <div className="text-xl text-warmGray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center card p-8">
          <svg className="w-16 h-16 mx-auto text-warmGray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="text-xl font-semibold text-warmGray-800 mb-2">User not found</div>
          <p className="text-warmGray-500 mb-4">This profile doesn't exist or has been removed</p>
          <Link to="/search" className="inline-block btn-primary">
            Search for Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Profile Header */}
      <div className="card p-6 sm:p-8 mb-8 border border-cream-300">
        <div className="flex items-start gap-8 flex-col sm:flex-row">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-primary-200 rounded-full flex items-center justify-center text-4xl font-bold text-primary-800 border border-primary-300">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={profile.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h1 className="text-3xl font-semibold text-warmGray-900">{profile.username}</h1>
              {isOwnProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="btn-outline rounded-full flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/messages"
                    state={{
                      openConversation: {
                        userId: profile._id,
                        username: profile.username,
                        profileImage: profile.profileImage
                      }
                    }}
                    className="btn-outline rounded-full"
                  >
                    Message
                  </Link>
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors ${
                      isFollowing
                        ? 'bg-warmGray-200 text-warmGray-800 hover:bg-warmGray-300'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Following
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Follow
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-xl text-warmGray-800">{posts.length}</div>
                <div className="text-sm text-warmGray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-warmGray-800">{profile.followersCount || 0}</div>
                <div className="text-sm text-warmGray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-xl text-warmGray-800">{profile.followingCount || 0}</div>
                <div className="text-sm text-warmGray-600">Following</div>
              </div>
            </div>
            
            {profile.bio && (
              <div className="bg-cream-200/60 p-3 rounded-lg border border-cream-300">
                <p className="text-warmGray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-warmGray-900 mb-4">Posts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12 card">
            <svg className="w-20 h-20 mx-auto text-warmGray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-warmGray-600 text-lg font-medium mb-2">{isOwnProfile ? 'You haven\'t posted yet' : 'No posts yet'}</p>
            <p className="text-warmGray-500">{isOwnProfile ? 'Share your first recipe with the community!' : 'Check back later for new content'}</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={profile}
        />
      )}
    </div>
  );
};

export default Profile;
