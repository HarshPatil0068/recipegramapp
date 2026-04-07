import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { postService, commentService, likeService } from '../services';
import { usePosts } from '../hooks';
import CommentSection from '../components/post/CommentSection';
import { useToast } from '../context/ToastContext';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editSteps, setEditSteps] = useState('');
  const [error, setError] = useState(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { deletePost: deletePostHook } = usePosts();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [postResponse, commentsResponse, likeResponse] = await Promise.all([
          postService.getPostById(postId),
          commentService.getComments(postId),
          likeService.checkIfLiked(postId),
        ]);
        const postData = postResponse;
        setPost(postData);
        setComments(commentsResponse.comments || []);
        setIsLiked(likeResponse.isLiked || false);
        setLikesCount(postData.likesCount || 0);
        setEditCaption(postData.caption || '');
        setEditIngredients(postData.ingredients?.join('\n') || '');
        setEditSteps(postData.steps?.join('\n') || '');
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    try {
      await likeService.toggleLike(postId);
      if (isLiked) {
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error.message || 'Failed to toggle like');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    try {
      const result = await deletePostHook(postId);
      if (result.success) {
        navigate('/');
      } else {
        showToast('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const ingredients = editIngredients.split('\n').filter(i => i.trim());
      const steps = editSteps.split('\n').filter(s => s.trim());
      
      const response = await postService.updatePost(postId, {
        caption: editCaption,
        ingredients,
        steps,
      });
      
      const updatedPost = response.post || response;
      setPost(updatedPost);
      setIsEditing(false);
      showToast('Post updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating post:', error);
      showToast(error.message || 'Failed to update post', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream-300 border-t-primary-500 mb-4"></div>
          <div className="text-xl text-warmGray-600">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center card p-8">
          <svg className="w-16 h-16 mx-auto text-error-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xl font-semibold text-warmGray-800 mb-2">Oops!</div>
          <div className="text-error-600 mb-6">{error}</div>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center card p-8">
          <svg className="w-16 h-16 mx-auto text-warmGray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xl font-semibold text-warmGray-700">Post not found</div>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser && post.author?._id === currentUser._id;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {error && (
        <div className="card bg-error-50 border-error-200 text-error-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="relative">
          {post.postType === 'reel' && post.video ? (
            <video
              src={post.video}
              className="w-full h-96 object-cover bg-black"
              controls
              loop
              playsInline
            />
          ) : (
            <img
              src={post.image}
              alt={post.caption}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="absolute top-4 left-4 bg-warmGray-900/60 text-cream-50 px-3 py-1 rounded-full text-sm font-medium">
            {post.postType === 'reel' ? 'Reel' : 'Recipe'}
          </div>
        </div>
        
        <div className="p-6">
          {/* Author Info and Actions */}
          <div className="flex items-center justify-between mb-4">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warmGray-200 rounded-full flex items-center justify-center font-bold text-warmGray-600">
                {post.author?.profileImage ? (
                  <img src={post.author.profileImage} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  post.author?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-semibold text-warmGray-900 hover:underline">{post.author?.username}</span>
            </Link>

            {isAuthor && !isEditing && (
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                {isConfirmingDelete ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-500 font-medium"
                    >
                      ✓ Confirm Delete
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-4 py-2 bg-warmGray-200 text-warmGray-700 rounded-lg hover:bg-warmGray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-500 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-warmGray-700 mb-2">Caption</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="input"
                  rows={3}
                  maxLength={2000}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmGray-700 mb-2">Ingredients (one per line)</label>
                <textarea
                  value={editIngredients}
                  onChange={(e) => setEditIngredients(e.target.value)}
                  className="input"
                  rows={5}
                  placeholder="Flour&#10;Sugar&#10;Eggs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmGray-700 mb-2">Steps (one per line)</label>
                <textarea
                  value={editSteps}
                  onChange={(e) => setEditSteps(e.target.value)}
                  className="input"
                  rows={5}
                  placeholder="Mix ingredients&#10;Bake for 30 minutes"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-warmGray-200 text-warmGray-700 rounded-lg hover:bg-warmGray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-warmGray-900 mb-4">{post.caption}</h2>

              {/* Like and Comment Actions */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-cream-300">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 hover:text-error-600 ${isLiked ? 'text-error-600' : 'text-warmGray-700'}`}
                >
                  <svg className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">{likesCount} likes</span>
                </button>
                <div className="flex items-center gap-2 text-warmGray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold">{post.commentsCount} comments</span>
                </div>
              </div>

              {/* Ingredients */}
              {post.postType !== 'reel' && post.ingredients && post.ingredients.length > 0 && (
                <div className="mb-6 bg-primary-50 p-5 rounded-xl border border-primary-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-warmGray-800">Ingredients</h3>
                    <span className="text-sm text-warmGray-600">({post.ingredients.length} items)</span>
                  </div>
                  <ul className="space-y-2">
                    {post.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2 text-warmGray-700">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cooking Steps */}
              {post.postType !== 'reel' && post.steps && post.steps.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-warmGray-800">Cooking Steps</h3>
                    <span className="text-sm text-warmGray-600">({post.steps.length} steps)</span>
                  </div>
                  <ol className="space-y-3">
                    {post.steps.map((step, index) => (
                      <li key={index} className="flex gap-3 bg-linear-to-r from-secondary-50 to-cream-50 p-4 rounded-lg border-l-4 border-secondary-500">
                        <div className="shrink-0 w-8 h-8 bg-secondary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-warmGray-700 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}

          {/* Comments Section */}
          <CommentSection postId={postId} comments={comments} setComments={setComments} />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
