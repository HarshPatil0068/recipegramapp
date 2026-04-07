import { useState, useRef } from 'react';

const FileUploadBox = ({
  onFileSelect,
  accept = 'image/*,video/*',
  label = 'Upload Media',
  maxSize = 50 * 1024 * 1024,
  isLoading = false,
  preview = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    const acceptTypes = accept.split(',').map((type) => type.trim());
    const isAllowed = acceptTypes.some((type) => {
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(`${baseType}/`);
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
    if (validateFile(file)) onFileSelect(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files.length > 0) handleFile(files[0]);
        }}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative rounded-[24px] border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? 'border-[rgb(var(--color-primary))] bg-sky-50'
            : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-app))] hover:bg-[rgb(var(--color-surface-muted))]'
        } ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
          accept={accept}
          disabled={isLoading}
          className="hidden"
        />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
          <svg className="h-8 w-8 text-[rgb(var(--color-text-soft))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 13v9m0 0-3-3m3 3 3-3" />
          </svg>
        </div>

        <p className="text-base font-bold text-black">{label}</p>
        <p className="mt-1 text-sm text-[rgb(var(--color-text-soft))]">Drag it here or click to browse</p>
        <p className="mt-2 text-xs font-medium text-[rgb(var(--color-text-faint))]">
          Images and videos up to {Math.round(maxSize / 1024 / 1024)}MB
        </p>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-white/85">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[rgb(var(--color-primary))] border-t-transparent" />
          </div>
        )}
      </div>

      {error && <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {preview && (
        <div className="mt-4 overflow-hidden rounded-[24px] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-app))]">
          {preview.type.startsWith('image/') ? (
            <img src={preview.url} alt="Preview" className="max-h-80 w-full object-cover" />
          ) : (
            <video src={preview.url} className="max-h-80 w-full" controls muted />
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadBox;
