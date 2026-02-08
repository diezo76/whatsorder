'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  maxSize?: number; // en MB
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = 'items',
  className = '',
  aspectRatio = 'square',
  maxSize = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  }[aspectRatio];

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    // Validation de la taille
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Fichier trop volumineux. Maximum ${maxSize}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post<{ success: boolean; url: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.url) {
        onChange(response.data.url);
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [folder, maxSize, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    onRemove?.();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        // Image prévisualisée
        <div className={`relative ${aspectRatioClass} rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50`}>
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay avec actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Changer l'image"
            >
              <Upload size={20} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Indicateur de chargement */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      ) : (
        // Zone de drop
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            ${aspectRatioClass} rounded-lg border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-3 transition-all
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Upload en cours...</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-gray-200">
                <ImageIcon className="w-8 h-8 text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Cliquez ou glissez une image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WebP ou GIF • Max {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
