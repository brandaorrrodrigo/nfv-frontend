'use client';

import { useState, useCallback, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

export default function UploadZone({
  onFilesSelected,
  maxFiles = 1,
  accept = 'image/jpeg,image/png,image/heic',
  label,
}: UploadZoneProps) {
  const t = useTranslations('assessment');
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files).slice(0, maxFiles - previews.length);
      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      const updated = [...previews, ...newPreviews].slice(0, maxFiles);
      setPreviews(updated);
      onFilesSelected(updated.map((p) => p.file));
    },
    [previews, maxFiles, onFilesSelected]
  );

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesSelected(updated.map((p) => p.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  if (previews.length > 0) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-[#d0dbe6]">
              <img src={preview.url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-nfv-danger/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {previews.length < maxFiles && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#d0dbe6] flex flex-col items-center justify-center gap-2 text-nfv-ice-muted hover:border-nfv-cyan/30 hover:text-nfv-cyan transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">{t('uploadZone.title')}</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-4 p-10
        rounded-2xl border-2 border-dashed cursor-pointer
        transition-all duration-300
        ${isDragging
          ? 'border-nfv-cyan bg-cyan-50 shadow-nfv'
          : 'border-[#d0dbe6] hover:border-nfv-cyan/30 hover:bg-[#f5f8fb]'
        }
      `}
    >
      <div className={`p-4 rounded-2xl ${isDragging ? 'bg-cyan-100' : 'bg-[#f5f8fb]'} transition-colors`}>
        {isDragging ? (
          <Upload className="w-10 h-10 text-nfv-cyan" />
        ) : (
          <Camera className="w-10 h-10 text-nfv-ice-muted" />
        )}
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium ${isDragging ? 'text-nfv-cyan' : 'text-nfv-ice-light'}`}>
          {isDragging ? t('uploadZone.uploading') : (label || t('uploadZone.title'))}
        </p>
        <p className="text-xs text-nfv-ice-muted mt-1">{t('uploadZone.subtitle')}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
