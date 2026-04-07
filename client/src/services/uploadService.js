import api from './api';

/**
 * Upload a file to Cloudinary via backend
 * @param {File} file - The file to upload
 * @param {String} type - 'image' or 'video'
 * @param {Function} onProgress - Callback for upload progress
 * @returns {Promise<Object>} - Upload response with URL and metadata
 */
export const uploadFile = async (file, type = 'image', onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  try {
    const response = await api.post('/posts/upload', formData, {
      // Uploads can legitimately take much longer than the default API timeout.
      timeout: 120000,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (!progressEvent.total) return;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        : undefined
    });

    return {
      success: true,
      url: response.url,
      publicId: response.publicId,
      resourceType: response.resourceType,
      width: response.width,
      height: response.height,
      size: response.size
    };
  } catch (error) {
    const timedOut = error.message?.toLowerCase().includes('timeout');
    return {
      success: false,
      error: timedOut
        ? 'Upload timed out after 2 minutes. Try a smaller file or check your Cloudinary/server connection.'
        : error.message
    };
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - The public ID of the file
 * @param {String} type - 'image' or 'video'
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFile = async (publicId, type = 'image') => {
  try {
    const response = await api.delete(`/posts/upload/${publicId}`, {
      data: { type }
    });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  uploadFile,
  deleteFile
};
