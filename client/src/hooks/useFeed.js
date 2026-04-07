import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import logger from '../utils/logger';
import {
  fetchFeedStart,
  fetchFeedSuccess,
  fetchFeedFailure,
  updateFeedPost,
  removeFeedPost,
} from '../store/slices/feedSlice';
import { postService } from '../services';

/**
 * Hook for managing personalized feed (posts from followed users)
 * Use this for the Home page instead of usePosts
 */
export const useFeed = () => {
  const dispatch = useDispatch();

  const fetchFeed = useCallback(async (page = 1, reset = false) => {
    try {
      dispatch(fetchFeedStart());
      
      const response = await postService.getFeed(page);

      // Backend returns { page, limit, total, totalPages, posts }
      const postsArray = response.posts || [];
      const hasMore = (response.page || page) < (response.totalPages || page);

      dispatch(fetchFeedSuccess({
        posts: postsArray,
        hasMore: hasMore,
        page: response.page || page,
        reset,
      }));

      return { success: true, posts: postsArray };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch feed";
      logger.error("Failed to fetch feed:", errorMsg);
      
      dispatch(fetchFeedFailure(errorMsg));
      return { success: false, error: errorMsg };
    }
  }, [dispatch]);

  const updatePost = useCallback((post) => {
    dispatch(updateFeedPost(post));
  }, [dispatch]);

  const removePost = useCallback((postId) => {
    dispatch(removeFeedPost(postId));
  }, [dispatch]);

  return {
    fetchFeed,
    updatePost,
    removePost,
  };
};
