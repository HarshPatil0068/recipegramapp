import createNotification from "../util/createNotification.js";
import Like from "../models/Like.model.js";
import Post from "../models/Post.model.js";

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const existingLike = await Like.findOne({
      user: req.user._id,
      post: postId
    });

    if (existingLike) {
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

      return res.json({ message: "Post unliked" });
    }

    await Like.create({
      user: req.user._id,
      post: postId
    });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // after liking
await createNotification({
  receiver: post.author,
  sender: req.user._id,
  type: "like",
  post: postId
});

    res.json({ message: "Post liked" });
  } catch (err) {
    res.status(500).json({ message: "Like action failed" });
  }
};




