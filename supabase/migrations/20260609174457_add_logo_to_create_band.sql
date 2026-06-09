-- Update create_band_with_admin function to accept logo_url
CREATE OR REPLACE FUNCTION public.create_band_with_admin(
  p_name text,
  p_slug text,
  p_description text DEFAULT NULL,
  p_genre text DEFAULT NULL,
  p_logo_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_band_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the band
  INSERT INTO bands (name, slug, description, genre, logo_url)
  VALUES (p_name, p_slug, p_description, p_genre, p_logo_url)
  RETURNING id INTO v_band_id;

  -- Add creator as admin
  INSERT INTO band_members (band_id, user_id, role)
  VALUES (v_band_id, v_user_id, 'admin');

  -- Update user's current band and onboarding status
  UPDATE profiles
  SET current_band_id = v_band_id,
      onboarding_completed = true
  WHERE id = v_user_id;

  RETURN v_band_id;
END;
$$;
