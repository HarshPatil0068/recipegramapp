import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import { uploadToCloudinary } from '../util/cloudinary.js';

// Get current user (me)
export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile by username
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const { bio, profileImage } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        'recipegram/profiles',
        'image',
        {
          original_filename: req.file.originalname,
          tags: [userId.toString(), 'profile']
        }
      );
      updateData.profileImage = uploadResult.secure_url;
    } else if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user's posts
export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .populate('author', 'username profileImage')
      .lean();
    
    const count = await Post.countDocuments({ author: userId });
    
    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};

// Search users
export const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    })
      .select('-password')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();
    
    const count = await User.countDocuments({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ]
    });
    
    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};
