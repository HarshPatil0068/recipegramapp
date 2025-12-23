import Post from "../models/Post.model.js";

export const createPost = async (req, res) => {
  try {
    const { caption, ingredients, steps, image } = req.body;

    if (!caption || !image) {
      return res.status(400).json({ message: "Caption and image are required" });
    }

    const post = await Post.create({
      caption,
      ingredients,
      steps,
      image,
      author: req.user._id
    });

    res.status(201).json({
      message: "Post created successfully",
      post
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username profileImage");

    res.json({
      page,
      limit,
      posts
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};
