'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  bandId?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export function LogoUpload({
  currentLogoUrl,
  bandId,
  onUpload,
  onRemove,
  className,
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Tipo de archivo no permitido. Usa JPG, PNG, GIF, WebP o SVG.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo es muy grande. Máximo 50MB.');
      return;
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${bandId || 'new'}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('band-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('band-logos').getPublicUrl(filePath);

      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error al subir el archivo');
      setPreviewUrl(currentLogoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 transition-colors hover:border-violet-500/50 hover:bg-zinc-800',
            uploading && 'cursor-not-allowed opacity-50'
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          ) : previewUrl ? (
            <Image src={previewUrl} alt="Logo preview" fill className="rounded-xl object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Music className="h-6 w-6 text-zinc-500" />
              <Upload className="h-3 w-3 text-zinc-600" />
            </div>
          )}

          {/* Remove button */}
          {previewUrl && !uploading && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute -right-2 -top-2 rounded-full bg-zinc-800 p-1 text-zinc-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-medium text-violet-400 transition-colors hover:text-violet-300 disabled:opacity-50"
          >
            {previewUrl ? 'Cambiar logo' : 'Subir logo'}
          </button>
          <p className="mt-1 text-xs text-zinc-500">JPG, PNG, GIF, WebP o SVG. Máx 50MB.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
