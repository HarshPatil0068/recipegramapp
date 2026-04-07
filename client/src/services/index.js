import api from './api';
import * as uploadService from './uploadService';

export { uploadService };

// Authentication services
export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// User services
export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response?.data || response;
  },

  getUserProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response?.data || response;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response?.data || response;
  },

  getUserPosts: async (userId, page = 1) => {
    const response = await api.get(`/users/${userId}/posts?page=${page}`);
    return {
      posts: response?.data || response?.posts || [],
      totalPages: response?.totalPages,
      currentPage: response?.currentPage,
    };
  },

  searchUsers: async (query, page = 1) => {
    const response = await api.get(`/users/search?q=${query}&page=${page}`);
    return {
      users: response?.data || response?.users || [],
      totalPages: response?.totalPages,
      currentPage: response?.currentPage,
    };
  },
};

// Post services
export const postService = {
  getAllPosts: async (page = 1, limit = 10) => {
    return await api.get(`/posts?page=${page}&limit=${limit}`);
  },

  getPostById: async (postId) => {
    return await api.get(`/posts/${postId}`);
  },

  createPost: async (postData) => {
    return await api.post('/posts', postData);
  },

  createReel: async (reelData) => {
    return await api.post('/posts', {
      ...reelData,
      postType: 'reel',
    });
  },

  updatePost: async (postId, postData) => {
    return await api.put(`/posts/${postId}`, postData);
  },

  deletePost: async (postId) => {
    return await api.delete(`/posts/${postId}`);
  },

  getFeed: async (page = 1, limit = 10) => {
    return await api.get(`/posts/feed?page=${page}&limit=${limit}`);
  },

  getReels: async (page = 1, limit = 10) => {
    return await api.get(`/posts/reels?page=${page}&limit=${limit}`);
  },

  searchPosts: async (query, page = 1, limit = 10) => {
    return await api.get(`/posts/search?q=${query}&page=${page}&limit=${limit}`);
  },

  getTrendingPosts: async (limit = 10) => {
    return await api.get(`/posts/trending?limit=${limit}`);
  },
};

// Like services
export const likeService = {
  toggleLike: async (postId) => {
    return await api.post(`/likes/${postId}`);
  },

  // Deprecated but kept for backwards compatibility
  likePost: async (postId) => {
    return await api.post(`/likes/${postId}`);
  },

  // Deprecated but kept for backwards compatibility
  unlikePost: async (postId) => {
    return await api.post(`/likes/${postId}`);
  },

  checkIfLiked: async (postId) => {
    return await api.get(`/likes/${postId}/check`);
  },

  getLikes: async (postId) => {
    return await api.get(`/likes/${postId}`);
  },
};

// Comment services
export const commentService = {
  getComments: async (postId) => {
    return await api.get(`/comments/${postId}`);
  },

  addComment: async (postId, text) => {
    return await api.post(`/comments/${postId}`, { text });
  },

  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  },
};

// Follow services
export const followService = {
  followUser: async (userId) => {
    return await api.post(`/follow/${userId}`);
  },

  unfollowUser: async (userId) => {
    return await api.post(`/follow/${userId}`);
  },

  getFollowers: async (userId) => {
    // NOTE: This route is not yet implemented on the backend
    return await api.get(`/follow/${userId}/followers`);
  },

  getFollowing: async (userId) => {
    // NOTE: This route is not yet implemented on the backend
    return await api.get(`/follow/${userId}/following`);
  },

  checkIfFollowing: async (userId) => {
    return await api.get(`/follow/${userId}/check`);
  },
};

// Save services
export const saveService = {
  toggleSave: async (postId) => {
    return await api.post(`/save/${postId}`);
  },

  // Deprecated but kept for backwards compatibility
  savePost: async (postId) => {
    return await api.post(`/save/${postId}`);
  },

  // Deprecated but kept for backwards compatibility
  unsavePost: async (postId) => {
    return await api.post(`/save/${postId}`);
  },

  getSavedPosts: async (page = 1, limit = 10) => {
    return await api.get(`/save?page=${page}&limit=${limit}`);
  },

  checkIfSaved: async (postId) => {
    return await api.get(`/save/${postId}/check`);
  },
};

// Notification services
export const notificationService = {
  getNotifications: async () => {
    return await api.get('/api/notifications');
  },

  markAsRead: async (notificationId) => {
    return await api.patch(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return await api.put('/api/notifications/read-all');
  },
};

export default {
  auth: authService,
  user: userService,
  post: postService,
  like: likeService,
  comment: commentService,
  follow: followService,
  save: saveService,
  notification: notificationService,
  upload: uploadService,
};
