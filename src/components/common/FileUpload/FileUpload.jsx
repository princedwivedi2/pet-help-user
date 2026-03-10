import { useRef, useState } from 'react';
import styles from './FileUpload.module.css';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name) {
  return name.split('.').pop().toLowerCase();
}

export default function FileUpload({
  files = [],
  onChange,
  maxFiles = 5,
  error,
  label = 'Upload Documents',
  required = false,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');

  const validateFile = (file) => {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      return `"${file.name}" is not a supported format. Use PDF, JPG, or PNG.`;
    }
    if (file.size > MAX_SIZE) {
      return `"${file.name}" exceeds 5MB limit (${formatSize(file.size)}).`;
    }
    return null;
  };

  const addFiles = (newFiles) => {
    setFileError('');
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      setFileError(`Maximum ${maxFiles} files allowed. You have ${files.length} already.`);
      return;
    }

    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) {
        setFileError(err);
        return;
      }
    }

    onChange([...files, ...fileArray]);
  };

  const removeFile = (index) => {
    setFileError('');
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const displayError = fileError || error;

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${displayError ? styles.dropzoneError : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={handleInputChange}
          className={styles.hiddenInput}
        />
        <div className={styles.dropzoneIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className={styles.dropzoneText}>
          Drag and drop files here, or click to browse
        </p>
        <p className={styles.dropzoneHint}>
          PDF, JPG, PNG up to 5MB each (max {maxFiles} files)
        </p>
      </div>

      {displayError && <span className={styles.error}>{displayError}</span>}

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileIcon}>
                  {file.type === 'application/pdf' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </span>
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatSize(file.size)}</span>
                </div>
              </div>
              {file.type?.startsWith('image/') && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className={styles.preview}
                />
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                aria-label={`Remove ${file.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
