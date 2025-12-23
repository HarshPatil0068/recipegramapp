import Follow from "../models/Follow.model.js";
import User from "../models/User.model.js";

export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id.toString();

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId
    });

    if (existingFollow) {
      await existingFollow.deleteOne();

      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: -1 }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $inc: { followersCount: -1 }
      });

      return res.json({ message: "User unfollowed" });
    }

    await Follow.create({
      follower: currentUserId,
      following: targetUserId
    });

    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: 1 }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $inc: { followersCount: 1 }
    });

    await createNotification({
  receiver: targetUserId,
  sender: currentUserId,
  type: "follow"
});

    res.json({ message: "User followed" });
  } catch (err) {
    res.status(500).json({ message: "Follow action failed" });
  }
};



