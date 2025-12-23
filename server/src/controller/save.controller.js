import User from "../models/User.model.js";

export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      user.savedPosts.pull(postId);
      await user.save();
      return res.json({ message: "Post unsaved" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({ message: "Post saved" });
  } catch (err) {
    res.status(500).json({ message: "Save action failed" });
  }
};
