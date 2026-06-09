'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
}

interface UseVideoUploadOptions {
  bucketName?: string;
  onUploadComplete?: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
}

export function useVideoUpload(options: UseVideoUploadOptions = {}) {
  const { bucketName = 'videos', onUploadComplete, onUploadError } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
  });

  const uploadVideo = useCallback(
    async (file: File) => {
      setState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedUrl: null,
      });

      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('Debes iniciar sesión para subir videos');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Simulate progress since Supabase doesn't provide upload progress
        const progressInterval = setInterval(() => {
          setState(prev => ({
            ...prev,
            progress: Math.min(prev.progress + Math.random() * 15, 90),
          }));
        }, 200);

        const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

        clearInterval(progressInterval);

        if (error) {
          throw error;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(data.path);

        setState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedUrl: publicUrl,
        });

        onUploadComplete?.(publicUrl, data.path);

        return { url: publicUrl, path: data.path };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al subir el video';

        setState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          uploadedUrl: null,
        });

        onUploadError?.(errorMessage);

        return null;
      }
    },
    [bucketName, onUploadComplete, onUploadError]
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
    });
  }, []);

  return {
    ...state,
    uploadVideo,
    reset,
  };
}
