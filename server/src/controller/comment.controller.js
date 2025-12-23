import Comment from "../models/Comment.model.js";
import Post from "../models/Post.model.js";

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });

    await createNotification({
  receiver: post.author,
  sender: req.user._id,
  type: "comment",
  post: postId
});

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};



