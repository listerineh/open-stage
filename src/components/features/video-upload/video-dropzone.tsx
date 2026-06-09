'use client';

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, Film, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
  'video/x-msvideo': ['.avi'],
  'video/x-matroska': ['.mkv'],
};

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function VideoDropzone({ onFileSelect, disabled = false }: VideoDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorMessage = rejection.errors[0]?.message || 'Archivo no válido';

        if (rejection.file.size > MAX_FILE_SIZE) {
          setError('El archivo excede el límite de 500MB');
        } else {
          setError(errorMessage);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    disabled,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragActive
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-red-500/50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4 text-center">
          {isDragActive ? (
            <>
              <div className="rounded-full bg-violet-500/20 p-4">
                <Film className="h-10 w-10 text-violet-400" />
              </div>
              <p className="text-lg font-medium text-violet-400">Suelta el video aquí</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-zinc-800 p-4">
                <Upload className="h-10 w-10 text-zinc-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">
                  Arrastra un video o haz clic para seleccionar
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  MP4, MOV, WebM, AVI, MKV • Máximo 500MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

interface VideoPreviewProps {
  file: File;
  onRemove: () => void;
  uploadProgress?: number;
  isUploading?: boolean;
}

export function VideoPreview({
  file,
  onRemove,
  uploadProgress = 0,
  isUploading = false,
}: VideoPreviewProps) {
  const [videoUrl] = useState(() => URL.createObjectURL(file));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-4">
      <div className="flex gap-4">
        <div className="relative aspect-video w-48 overflow-hidden rounded-md bg-zinc-800">
          <video src={videoUrl} className="h-full w-full object-cover" muted playsInline />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="font-medium text-white truncate">{file.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{formatFileSize(file.size)}</p>
          </div>

          {isUploading ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subiendo...</span>
                <span className="text-violet-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="mt-2 w-fit text-zinc-400 hover:text-red-400"
            >
              <X className="mr-1 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
