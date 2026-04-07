import { useState } from 'react';
import { useSelector } from 'react-redux';
import { commentService } from '../../services';

const CommentSection = ({ postId, comments, setComments }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);

  // Ensure comments is always an array
  const safeComments = comments || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isAuthenticated) return;

    if (newComment.length > 500) {
      setError('Comment must be 500 characters or less');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await commentService.addComment(postId, newComment);
      const newCommentData = response.comment;
      if (newCommentData) {
        setComments([newCommentData, ...safeComments]);
      }
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (confirmDeleteId !== commentId) {
      setConfirmDeleteId(commentId);
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      setComments(safeComments.filter(c => c._id !== commentId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="mt-6 border-t border-cream-300 pt-4">
      <h3 className="font-semibold text-warmGray-900 mb-4">Comments</h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="input flex-1"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <p className="text-error-500 text-sm mt-2">{error}</p>}
          <p className="text-xs text-warmGray-500 mt-1">{newComment.length}/500 characters</p>
        </form>
      )}

      <div className="space-y-4">
        {safeComments.length === 0 ? (
          <p className="text-warmGray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          safeComments.map((comment) => {
            const isCommentAuthor = currentUser && comment.user?._id === currentUser._id;
            
            return (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 bg-warmGray-200 rounded-full flex items-center justify-center font-bold text-warmGray-600 text-sm shrink-0">
                  {comment.user?.profileImage ? (
                    <img 
                      src={comment.user.profileImage} 
                      alt={comment.user.username} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    comment.user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-cream-200 rounded-lg px-4 py-2 border border-cream-300">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-warmGray-900">{comment.user?.username}</span>
                      {isCommentAuthor && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-error-500 hover:text-error-600 text-xs"
                            title="Delete comment"
                          >
                            {confirmDeleteId === comment._id ? 'Confirm' : 'Delete'}
                          </button>
                          {confirmDeleteId === comment._id && (
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-warmGray-500 hover:text-warmGray-700 text-xs"
                              title="Cancel delete"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-warmGray-700 mt-1">{comment.text}</p>
                  </div>
                  <div className="text-xs text-warmGray-500 mt-1 px-4">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;
