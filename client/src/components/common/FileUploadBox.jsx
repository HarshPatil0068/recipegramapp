import { useState, useRef } from 'react';

/**
 * FileUploadBox - A reusable component for file uploads with drag-drop support
 * Features: drag-drop, file preview, file type validation
 */
const FileUploadBox = ({
  onFileSelect,
  accept = "image/*,video/*",
  label = "Upload Media",
  maxSize = 50 * 1024 * 1024, // 50MB
  isLoading = false,
  preview = null
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    // Check file type based on accept attribute
    const acceptTypes = accept.split(',').map(type => type.trim());
    const isAllowed = acceptTypes.some(type => {
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType + '/');
      }
      return file.type === type;
    });

    if (!isAllowed) {
      setError(`File type not allowed. Please upload ${accept}`);
      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    setError('');
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* File Input Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-warmGray-300 hover:border-warmGray-400 bg-warmGray-50 hover:bg-warmGray-100'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept={accept}
          disabled={isLoading}
          className="hidden"
        />

        {/* Upload Icon */}
        <div className="mb-3">
          <svg className="w-12 h-12 mx-auto text-warmGray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>

        {/* Text */}
        <p className="text-warmGray-900 font-semibold mb-1">{label}</p>
        <p className="text-sm text-warmGray-600">or drag and drop your file here</p>
        <p className="text-xs text-warmGray-500 mt-2">Supported: Images & Videos (max {Math.round(maxSize / 1024 / 1024)}MB)</p>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium text-warmGray-700 mb-2">Preview:</p>
          <div className="rounded-lg overflow-hidden bg-warmGray-100 max-h-64">
            {preview.type.startsWith('image/') ? (
              <img src={preview.url} alt="Preview" className="w-full h-auto object-cover" />
            ) : (
              <video src={preview.url} className="w-full h-auto" controls muted />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadBox;
