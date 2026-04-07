import { uploadToCloudinary, deleteFromCloudinary } from "../util/cloudinary.js";

/**
 * Upload a file to Cloudinary
 * @route POST /posts/upload
 * @access Private
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { type = 'image' } = req.body; // type can be 'image', 'video', or 'profile'
    
    // Determine resource type based on file mime type or request body
    let resourceType = 'image';
    if (type === 'video' || req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    const folder = type === 'profile'
      ? 'recipegram/profiles'
      : `recipegram/${resourceType === 'video' ? 'reels' : 'posts'}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      folder,
      resourceType,
      {
        original_filename: req.file.originalname,
        tags: [req.user._id.toString(), resourceType],
      }
    );

    res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      size: result.bytes
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message || "Failed to upload file" });
  }
};

/**
 * Delete a file from Cloudinary
 * @route DELETE /posts/upload/:publicId
 * @access Private
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { type = 'image' } = req.body;

    const resourceType = type === 'video' ? 'video' : 'image';
    
    const result = await deleteFromCloudinary(publicId, resourceType);

    res.status(200).json({
      message: "File deleted successfully",
      result
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message || "Failed to delete file" });
  }
};

export default { uploadFile, deleteFile };
