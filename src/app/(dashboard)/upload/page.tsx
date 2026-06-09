'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoDropzone, VideoPreview } from '@/components/features/video-upload';
import { useVideoUpload } from '@/hooks/use-video-upload';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isUploading, progress, error, uploadedUrl, uploadVideo, reset } = useVideoUpload({
    onUploadComplete: (url, path) => {
      console.log('Video uploaded:', url, path);
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadVideo(selectedFile);
  };

  const handleContinue = () => {
    if (uploadedUrl) {
      router.push(`/clips/new?video=${encodeURIComponent(uploadedUrl)}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Subir Video</h1>
          <p className="mt-2 text-zinc-400">
            Sube un video de tu show, ensayo o sesión para generar clips optimizados
          </p>
        </div>

        <div className="space-y-6">
          {!selectedFile ? (
            <VideoDropzone onFileSelect={handleFileSelect} disabled={isUploading} />
          ) : (
            <VideoPreview
              file={selectedFile}
              onRemove={handleRemove}
              uploadProgress={progress}
              isUploading={isUploading}
            />
          )}

          {error && (
            <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          {selectedFile && !uploadedUrl && (
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={isUploading} size="lg">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Subir Video'
                )}
              </Button>
            </div>
          )}

          {uploadedUrl && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-400">
                ¡Video subido exitosamente!
              </div>
              <div className="flex justify-end">
                <Button onClick={handleContinue} size="lg">
                  Continuar a generar clips
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
