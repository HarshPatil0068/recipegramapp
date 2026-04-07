import Post from "../models/Post.model.js";
import Follow from "../models/Follow.model.js";
import Comment from "../models/Comment.model.js";
import Like from "../models/Like.model.js";

/**
 * Create a new post
 * @route POST /posts
 * @access Private
 */
export const createPost = async (req, res) => {
  try {
    const { caption, ingredients, steps, image, video, postType = "recipe" } = req.body;

    const post = await Post.create({
      postType,
      caption,
      ingredients: postType === "reel" ? [] : ingredients,
      steps: postType === "reel" ? [] : steps,
      image: postType === "reel" ? undefined : image,
      video: postType === "reel" ? video : undefined,
      author: req.user._id
    });

    // Populate author data directly on the created post
    await post.populate("author", "username profileImage");

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

/**
 * Get all posts with pagination
 * @route GET /posts?page=1&limit=10
 * @access Private
 */
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get all posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/**
 * Get a single post by ID
 * @route GET /posts/:id
 * @access Private
 */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate("author", "username profileImage");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Get post by ID error:", err);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

/**
 * Get personalized feed (posts from followed users + own posts)
 * @route GET /posts/feed?page=1&limit=10
 * @access Private
 */
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get list of users the current user is following (use distinct for better performance)
    const followingIds = await Follow.distinct("following", { follower: req.user._id });

    // Include the current user's own posts as well
    followingIds.push(req.user._id);

    const total = await Post.countDocuments({ author: { $in: followingIds } });
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get feed error:", err);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};

/**
 * Get reels feed with pagination
 * @route GET /posts/reels?page=1&limit=10
 * @access Private
 */
export const getReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { postType: "reel" };
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      total,
      totalPages,
      posts
    });
  } catch (err) {
    console.error("Get reels error:", err);
    res.status(500).json({ message: "Failed to fetch reels" });
  }
};

/**
 * Update a post (author only)
 * @route PUT /posts/:id
 * @access Private
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, ingredients, steps, image, video, postType } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check - only post author can update
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Update only provided fields
    if (caption !== undefined) post.caption = caption;
    if (ingredients !== undefined) post.ingredients = ingredients;
    if (steps !== undefined) post.steps = steps;
    if (image !== undefined) post.image = image;
    if (video !== undefined) post.video = video;
    if (postType !== undefined) post.postType = postType;

    if (post.postType === "reel") {
      post.image = undefined;
      post.ingredients = [];
      post.steps = [];
    } else {
      post.video = undefined;
    }

    await post.save();
    await post.populate("author", "username profileImage");

    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

/**
 * Delete a post (author only) with cascade delete of comments and likes
 * @route DELETE /posts/:id
 * @access Private
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check - only post author can delete
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Cascade delete: remove all comments and likes associated with this post
    await Comment.deleteMany({ post: id });
    await Like.deleteMany({ post: id });

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

/**
 * Search posts by caption or ingredients
 * @route GET /posts/search?q=keyword&page=1&limit=10
 * @access Private
 */
export const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search in caption, ingredients array
    const searchRegex = new RegExp(q.trim(), 'i');
    const query = {
      $or: [
        { caption: searchRegex },
        { ingredients: searchRegex }
      ]
    };

    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username profileImage");

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      posts,
      query: q
    });
  } catch (err) {
    console.error("Search posts error:", err);
    res.status(500).json({ message: "Failed to search posts" });
  }
};

/**
 * Get trending posts (most liked in last 7 days, fallback to recent posts)
 * @route GET /posts/trending?limit=10
 * @access Private
 */
export const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get posts from last 7 days, sorted by likes count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let posts = await Post.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(limit)
      .populate("author", "username profileImage");

    // If not enough trending posts, fill with recent posts
    if (posts.length < limit) {
      const recentPosts = await Post.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "username profileImage");
      
      // Merge and deduplicate
      const postIds = new Set(posts.map(p => p._id.toString()));
      const additionalPosts = recentPosts.filter(p => !postIds.has(p._id.toString()));
      posts = [...posts, ...additionalPosts].slice(0, limit);
    }

    res.json({ posts });
  } catch (err) {
    console.error("Get trending posts error:", err);
    res.status(500).json({ message: "Failed to fetch trending posts" });
  }
};
