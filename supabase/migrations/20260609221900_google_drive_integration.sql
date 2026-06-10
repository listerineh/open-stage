-- Migration: Google Drive Integration
-- Adds Drive connection fields to bands and creates clips table

-- Add Google Drive fields to bands table
ALTER TABLE bands
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT,
ADD COLUMN IF NOT EXISTS drive_folder_name TEXT,
ADD COLUMN IF NOT EXISTS drive_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS drive_connected_by UUID REFERENCES profiles(id);

-- Create clips table for metadata (actual files stored in Google Drive)
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Clip metadata
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in seconds
  format TEXT NOT NULL, -- tiktok, reels, shorts, instagram, youtube
  aspect_ratio TEXT NOT NULL, -- 9:16, 1:1, 16:9
  
  -- Google Drive info
  drive_file_id TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Source video info
  source_video_url TEXT,
  start_time INTEGER, -- in seconds
  end_time INTEGER, -- in seconds
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries (only if column exists)
CREATE INDEX IF NOT EXISTS idx_clips_band_id ON clips(band_id);
-- Note: idx_clips_created_by and idx_clips_created_at created in fix migration

-- Enable RLS
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clips
-- Users can view clips from bands they belong to
CREATE POLICY "Users can view clips from their bands"
  ON clips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = clips.band_id
      AND band_members.user_id = auth.uid()
    )
  );

-- Users can insert clips to bands they belong to (editor or admin)
CREATE POLICY "Editors can create clips"
  ON clips FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = clips.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role IN ('admin', 'editor')
    )
  );

-- Users can update their own clips or if admin
CREATE POLICY "Users can update own clips or admin"
  ON clips FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = clips.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'admin'
    )
  );

-- Users can delete their own clips or if admin
CREATE POLICY "Users can delete own clips or admin"
  ON clips FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM band_members
      WHERE band_members.band_id = clips.band_id
      AND band_members.user_id = auth.uid()
      AND band_members.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_clips_updated_at
  BEFORE UPDATE ON clips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
