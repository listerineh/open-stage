export type BandRole = 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  current_band_id: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Band {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  genre: string | null;
  created_by: string | null;
  // Google Drive integration
  drive_folder_id: string | null;
  drive_folder_name: string | null;
  drive_connected_at: string | null;
  drive_connected_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ClipFormat = 'tiktok' | 'reels' | 'shorts' | 'instagram' | 'youtube';

export interface Clip {
  id: string;
  band_id: string;
  created_by: string;
  name: string;
  description: string | null;
  duration: number;
  format: ClipFormat;
  aspect_ratio: string;
  drive_file_id: string;
  drive_url: string;
  thumbnail_url: string | null;
  source_video_url: string | null;
  start_time: number | null;
  end_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface BandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: BandRole;
  joined_at: string;
}

export interface BandInvitation {
  id: string;
  band_id: string;
  code: string;
  created_by: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  drive_folder_id: string | null;
  role: BandRole;
  is_current: boolean;
}

export interface BandWithRole extends Band {
  role: BandRole;
  is_current: boolean;
}
