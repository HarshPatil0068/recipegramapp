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
    <div className="mt-4 border-t border-[rgb(var(--color-border))] pt-4">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-black">Comments</h3>

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
              className="btn-primary rounded-full px-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-1 text-xs text-[rgb(var(--color-text-faint))]">{newComment.length}/500 characters</p>
        </form>
      )}

      <div className="space-y-4">
        {safeComments.length === 0 ? (
          <p className="py-4 text-center text-sm text-[rgb(var(--color-text-soft))]">No comments yet. Be the first to comment.</p>
        ) : (
          safeComments.map((comment) => {
            const isCommentAuthor = currentUser && comment.user?._id === currentUser._id;
            
            return (
              <div key={comment._id} className="flex gap-3">
                <div className="avatar h-8 w-8 shrink-0 text-sm">
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
                  <div className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-app))] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-black">{comment.user?.username}</span>
                      {isCommentAuthor && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-xs text-red-600 hover:text-red-700"
                            title="Delete comment"
                          >
                            {confirmDeleteId === comment._id ? 'Confirm' : 'Delete'}
                          </button>
                          {confirmDeleteId === comment._id && (
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-[rgb(var(--color-text-soft))] hover:text-black"
                              title="Cancel delete"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--color-text))]">{comment.text}</p>
                  </div>
                  <div className="mt-1 px-4 text-xs text-[rgb(var(--color-text-faint))]">
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
