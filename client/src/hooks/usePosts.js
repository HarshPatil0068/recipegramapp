import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import logger from '../utils/logger';
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
  addPost as addPostAction,
  updatePost as updatePostAction,
  deletePost as deletePostAction,
  likePost as likePostAction,
  unlikePost as unlikePostAction,
  addComment as addCommentAction,
} from '../store/slices/postSlice';
import { postService, likeService, commentService } from '../services';

export const usePosts = () => {
  const dispatch = useDispatch();

  const fetchPosts = useCallback(async (page = 1, reset = false) => {
    try {
      dispatch(fetchPostsStart());
      
      const response = await postService.getAllPosts(page);

      // Backend returns { page, limit, total, totalPages, posts }
      const postsArray = response.posts || [];
      const hasMore = (response.page || page) < (response.totalPages || page);

      dispatch(fetchPostsSuccess({
        posts: postsArray,
        hasMore: hasMore,
        page: response.page || page,
        reset,
      }));

      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch posts";
      logger.error("Failed to fetch posts:", errorMsg);
      
      dispatch(fetchPostsFailure(errorMsg));
      return { success: false, error: errorMsg };
    }
  }, [dispatch]);

  const createPost = useCallback(async (postData) => {
    try {
      const response = await postService.createPost(postData);
      const createdPost = response.post || response;
      dispatch(addPostAction(createdPost));
      return { success: true, data: createdPost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const updatePost = useCallback(async (postId, postData) => {
    try {
      const response = await postService.updatePost(postId, postData);
      const updatedPost = response.post || response;
      dispatch(updatePostAction(updatedPost));
      return { success: true, data: updatedPost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const deletePost = useCallback(async (postId) => {
    try {
      await postService.deletePost(postId);
      dispatch(deletePostAction(postId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const likePost = useCallback(async (postId) => {
    try {
      await likeService.likePost(postId);
      dispatch(likePostAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const unlikePost = useCallback(async (postId) => {
    try {
      await likeService.unlikePost(postId);
      dispatch(unlikePostAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const addComment = useCallback(async (postId, content) => {
    try {
      await commentService.addComment(postId, content);
      dispatch(addCommentAction({ postId }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  return {
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
  };
};
