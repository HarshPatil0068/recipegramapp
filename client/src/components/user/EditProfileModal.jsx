import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import FileUploadBox from '../common/FileUploadBox';
import { userService, uploadService } from '../../services';
import { fetchUserSuccess } from '../../store/slices/userSlice';
import { updateUser } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';

const EditProfileModal = ({ isOpen, onClose, currentProfile }) => {
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  useEffect(() => {
    if (currentProfile) {
      setBio(currentProfile.bio || '');
      setProfileImage(currentProfile.profileImage || '');
      setSelectedFile(null);
      setUploadProgress(0);
    }
  }, [currentProfile]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageUrl = profileImage;

      if (selectedFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadService.uploadFile(selectedFile, 'profile', setUploadProgress);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload profile image');
        }

        uploadedImageUrl = uploadResult.url;
      }

      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('profileImage', uploadedImageUrl || '');

      const response = await userService.updateProfile(formData);
      dispatch(fetchUserSuccess(response));
      dispatch(updateUser(response));
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setIsUploadingImage(false);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-warmGray-900/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-warmGray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-warmGray-500 hover:text-warmGray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-warmGray-700 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input"
                rows={4}
                maxLength={200}
                placeholder="Tell us about yourself..."
              />
              <p className="text-sm text-warmGray-500 mt-1">
                {bio.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Image
              </label>
              <FileUploadBox
                onFileSelect={handleFileSelect}
                accept="image/*"
                label="Upload profile photo"
                maxSize={10 * 1024 * 1024}
                isLoading={isUploadingImage}
                preview={profileImage ? { url: profileImage, type: 'image/jpeg' } : null}
              />
              {isUploadingImage && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-warmGray-600">
                    <span>Uploading image</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-warmGray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-warmGray-500 mt-3 mb-2">Or paste an image URL:</p>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-warmGray-200 text-warmGray-700 rounded-lg hover:bg-warmGray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
