import '../config/env.js';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary with credentials from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer to upload
 * @param {String} folder - The folder in Cloudinary to store the file
 * @param {String} resourceType - 'image' or 'video'
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Cloudinary response with secure_url
 */
export const uploadToCloudinary = async (
  buffer,
  folder = 'recipegram',
  resourceType = 'image',
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        quality: 'auto',
        fetch_format: 'auto',
        eager: [
          { width: 500, height: 500, crop: 'fill', quality: 'auto' },
          { width: 200, height: 200, crop: 'fill', quality: 'auto' }
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - The public ID of the file to delete
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Get optimization parameters for image delivery
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @returns {String} - Cloudinary transformation URL parameter
 */
export const getOptimizedUrl = (baseUrl, width = 500, height = 500) => {
  if (!baseUrl) return '';
  // Transform URL to include optimization
  return baseUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
};

export default cloudinary;
