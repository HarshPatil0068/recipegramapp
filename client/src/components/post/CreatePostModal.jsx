import { useEffect, useState } from 'react';
import { usePosts } from '../../hooks';
import FileUploadBox from '../common/FileUploadBox';
import { uploadService } from '../../services';

const CreatePostModal = ({ isOpen, onClose, initialType = 'recipe' }) => {
  const [postType, setPostType] = useState(initialType);
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createPost } = usePosts();

  useEffect(() => {
    if (isOpen) {
      setPostType(initialType);
    }
  }, [initialType, isOpen]);

  const handleFileSelect = async (file) => {
    setMediaFile(file);
    setUploadProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        url: reader.result,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setUploadProgress(0);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients.length > 0 ? newIngredients : ['']);
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps.length > 0 ? newSteps : ['']);
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }
    
    if (!mediaFile && !mediaPreview?.url?.startsWith('http')) {
      setError(postType === 'reel' ? 'Please upload or provide a video' : 'Please upload or provide an image');
      return;
    }

    // If mediaPreview exists but it's from local file selection, we need to upload
    let mediaUrl = null;
    if (mediaFile) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadService.uploadFile(
          mediaFile,
          postType === 'reel' ? 'video' : 'image',
          setUploadProgress
        );

        if (!uploadResult.success) {
          setError(uploadResult.error || 'Failed to upload file');
          setIsUploading(false);
          return;
        }

        mediaUrl = uploadResult.url;
      } catch (err) {
        setError('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else {
      mediaUrl = mediaPreview?.url;
    }

    setLoading(true);

    // Filter out empty ingredients and steps
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    const filteredSteps = steps.filter(step => step.trim() !== '');

    const postData = {
      postType,
      caption: caption.trim(),
      ingredients: postType === 'reel' ? [] : filteredIngredients,
      steps: postType === 'reel' ? [] : filteredSteps,
      ...(postType === 'reel'
        ? { video: mediaUrl }
        : { image: mediaUrl }),
    };

    try {
      const result = await createPost(postData);
      
      if (result.success) {
        // Reset form
        setCaption('');
        setMediaFile(null);
        setMediaPreview(null);
        setUploadProgress(0);
        setPostType(initialType);
        setIngredients(['']);
        setSteps(['']);
        onClose();
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cream-300 shadow-xl">
        <div className="sticky top-0 bg-cream-50 border-b border-cream-300 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-warmGray-900">
              Create New {postType === 'reel' ? 'Reel' : 'Recipe Post'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-warmGray-100 rounded-full transition-colors text-warmGray-600"
              disabled={loading || isUploading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-warmGray-900 mb-3">
                Post Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['recipe', 'reel'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`p-4 rounded-xl border transition-all ${
                      postType === type
                        ? 'border-primary-400 bg-primary-50 text-primary-800'
                        : 'border-cream-300 bg-cream-100 hover:border-warmGray-300 text-warmGray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {type === 'recipe' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      )}
                    </div>
                    <p className="font-medium text-warmGray-900 capitalize">{type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-semibold text-warmGray-900 mb-3">
                {postType === 'reel' ? 'Upload Video' : 'Upload Image'}
              </label>
              {!mediaPreview ? (
                <FileUploadBox
                  onFileSelect={handleFileSelect}
                  accept={postType === 'reel' ? 'video/*' : 'image/*'}
                  label={postType === 'reel' ? 'Upload your video' : 'Upload your recipe photo'}
                  isLoading={isUploading}
                />
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden bg-warmGray-100 max-h-72">
                    {mediaPreview.type.startsWith('image/') ? (
                      <img src={mediaPreview.url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={mediaPreview.url} className="w-full h-full" controls muted />
                    )}
                  </div>
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-warmGray-600">
                        <span>Uploading media</span>
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
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="w-full py-2 px-4 border border-red-300 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Remove & Choose Different File
                  </button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-semibold text-warmGray-900 mb-2">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={postType === 'reel' ? 'Tell a story about your reel...' : 'Share your recipe details...'}
                className="w-full px-4 py-3 border border-warmGray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none"
                rows="4"
              />
              <p className="text-xs text-warmGray-500 mt-1">{caption.length}/2000</p>
            </div>

            {/* Recipe Details (only for recipe posts) */}
            {postType === 'recipe' && (
              <>
                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-warmGray-900">
                      Ingredients
                    </label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-xs text-primary-700 hover:text-primary-800 font-medium"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder="e.g., 2 cups flour"
                          className="flex-1 px-4 py-2 border border-warmGray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                        />
                        {ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-warmGray-900">
                      Cooking Steps
                    </label>
                    <button
                      type="button"
                      onClick={addStep}
                      className="text-xs text-primary-700 hover:text-primary-800 font-medium"
                    >
                      + Add Step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-semibold text-sm">
                          {index + 1}
                        </span>
                        <textarea
                          value={step}
                          onChange={(e) => updateStep(index, e.target.value)}
                          placeholder="Describe this step..."
                          className="flex-1 px-4 py-2 border border-warmGray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none"
                          rows="2"
                        />
                        {steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-cream-300">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || isUploading}
                className="flex-1 py-3 px-4 border border-warmGray-300 text-warmGray-700 rounded-lg hover:bg-cream-100 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isUploading}
                className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading || isUploading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create {postType === 'reel' ? 'Reel' : 'Post'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
