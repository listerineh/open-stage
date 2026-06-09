-- Create storage bucket for band logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'band-logos',
  'band-logos',
  true,
  52428800, -- 50MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view band logos (public bucket)
CREATE POLICY "Public can view band logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'band-logos');

-- Policy: Band admins can upload logos
CREATE POLICY "Band admins can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'band-logos'
    AND auth.uid() IS NOT NULL
  );

-- Policy: Band admins can update logos
CREATE POLICY "Band admins can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'band-logos'
    AND auth.uid() IS NOT NULL
  );

-- Policy: Band admins can delete logos
CREATE POLICY "Band admins can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'band-logos'
    AND auth.uid() IS NOT NULL
  );
