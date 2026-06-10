-- Fix clips table - add missing columns if they don't exist

-- Add columns to existing clips table
ALTER TABLE clips
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT,
ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
ADD COLUMN IF NOT EXISTS drive_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS source_video_url TEXT,
ADD COLUMN IF NOT EXISTS start_time INTEGER,
ADD COLUMN IF NOT EXISTS end_time INTEGER;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_clips_created_by ON clips(created_by);
CREATE INDEX IF NOT EXISTS idx_clips_created_at ON clips(created_at DESC);

-- Add Google Drive fields to bands if not exist
ALTER TABLE bands
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT,
ADD COLUMN IF NOT EXISTS drive_folder_name TEXT,
ADD COLUMN IF NOT EXISTS drive_connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS drive_connected_by UUID REFERENCES profiles(id);
