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
    if (isOpen) setPostType(initialType);
  }, [initialType, isOpen]);

  const resetForm = () => {
    setCaption('');
    setMediaFile(null);
    setMediaPreview(null);
    setUploadProgress(0);
    setIngredients(['']);
    setSteps(['']);
    setError('');
    setPostType(initialType);
  };

  const handleFileSelect = (file) => {
    setMediaFile(file);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        url: reader.result,
        type: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!caption.trim()) {
      setError('Caption is required');
      return;
    }

    if (!mediaFile && !mediaPreview?.url?.startsWith('http')) {
      setError(postType === 'reel' ? 'Please upload a video' : 'Please upload an image');
      return;
    }

    let mediaUrl = mediaPreview?.url || null;

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
      } catch {
        setError('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    setLoading(true);

    const postData = {
      postType,
      caption: caption.trim(),
      ingredients: postType === 'reel' ? [] : ingredients.filter((item) => item.trim() !== ''),
      steps: postType === 'reel' ? [] : steps.filter((item) => item.trim() !== ''),
      ...(postType === 'reel' ? { video: mediaUrl } : { image: mediaUrl }),
    };

    try {
      const result = await createPost(postData);
      if (result.success) {
        resetForm();
        onClose();
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/65 p-4 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-center">
        <div className="w-full max-h-[92vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl">
          <div className="sticky top-0 z-10 border-b border-[rgb(var(--color-border))] bg-white/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--color-text-faint))]">Create</p>
                <h2 className="mt-1 text-2xl font-extrabold text-black">
                  {postType === 'reel' ? 'New reel' : 'New recipe post'}
                </h2>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="btn-ghost h-10 w-10 rounded-full p-0"
                disabled={loading || isUploading}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 p-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {['recipe', 'reel'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`rounded-[24px] border p-5 text-left transition ${
                      postType === type
                        ? 'border-[rgb(var(--color-primary))] bg-sky-50 shadow-sm'
                        : 'border-[rgb(var(--color-border))] bg-white hover:bg-[rgb(var(--color-app))]'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgb(var(--color-text-faint))]">Format</p>
                    <p className="mt-2 text-lg font-bold capitalize text-black">{type}</p>
                    <p className="mt-1 text-sm text-[rgb(var(--color-text-soft))]">
                      {type === 'recipe' ? 'Photo-first post with ingredients and steps.' : 'Vertical short-form cooking moment.'}
                    </p>
                  </button>
                ))}
              </div>

              <FileUploadBox
                onFileSelect={handleFileSelect}
                accept={postType === 'reel' ? 'video/*' : 'image/*'}
                label={postType === 'reel' ? 'Upload your reel' : 'Upload your hero image'}
                isLoading={isUploading}
              />

              {mediaPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setUploadProgress(0);
                  }}
                  className="btn-outline w-full rounded-full"
                >
                  Remove selected file
                </button>
              )}
            </div>

            <div className="space-y-5">
              {error && <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div>
                <label className="mb-2 block text-sm font-bold text-black">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption that feels scroll-stopping..."
                  className="input min-h-32 resize-none"
                  rows="5"
                />
                <p className="mt-2 text-right text-xs text-[rgb(var(--color-text-faint))]">{caption.length}/2000</p>
              </div>

              {postType === 'recipe' && (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-sm font-bold text-black">Ingredients</label>
                      <button type="button" onClick={() => setIngredients((prev) => [...prev, ''])} className="text-sm font-semibold text-[rgb(var(--color-primary))]">
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={`${index}-ingredient`} className="flex gap-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => {
                              const next = [...ingredients];
                              next[index] = e.target.value;
                              setIngredients(next);
                            }}
                            placeholder="2 cups flour"
                            className="input"
                          />
                          {ingredients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setIngredients((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                              className="btn-outline min-w-11 px-0"
                            >
                              x
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="text-sm font-bold text-black">Steps</label>
                      <button type="button" onClick={() => setSteps((prev) => [...prev, ''])} className="text-sm font-semibold text-[rgb(var(--color-primary))]">
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div key={`${index}-step`} className="flex gap-2">
                          <textarea
                            value={step}
                            onChange={(e) => {
                              const next = [...steps];
                              next[index] = e.target.value;
                              setSteps(next);
                            }}
                            placeholder={`Step ${index + 1}`}
                            className="input min-h-20 resize-none"
                          />
                          {steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSteps((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
                              className="btn-outline min-w-11 self-start px-0"
                            >
                              x
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(loading || isUploading) && (
                <div className="rounded-[24px] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-app))] px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm font-medium text-[rgb(var(--color-text-soft))]">
                    <span>{isUploading ? 'Uploading media' : 'Publishing post'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full bg-[rgb(var(--color-primary))] transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  disabled={loading || isUploading}
                  className="btn-outline flex-1 rounded-full"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading || isUploading} className="btn-primary flex-1 rounded-full">
                  {loading || isUploading ? 'Posting...' : 'Share'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
