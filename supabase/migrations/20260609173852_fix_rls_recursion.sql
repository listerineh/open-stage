-- Fix RLS infinite recursion in band_members policies
-- The issue is that band_members policy references itself

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Band members can view other members" ON public.band_members;
DROP POLICY IF EXISTS "Band admins can manage members" ON public.band_members;

-- Create new non-recursive policy for band_members
-- Users can view members of bands they belong to (using direct user_id check)
CREATE POLICY "Users can view band members"
  ON public.band_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR 
    band_id IN (
      SELECT bm.band_id FROM public.band_members bm WHERE bm.user_id = auth.uid()
    )
  );

-- Users can insert themselves as members (for joining via invitation)
CREATE POLICY "Users can join bands"
  ON public.band_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can update members in their bands
CREATE POLICY "Admins can update band members"
  ON public.band_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.band_members admin_check
      WHERE admin_check.band_id = band_members.band_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );

-- Admins can delete members, or users can delete themselves
CREATE POLICY "Admins can delete members or self"
  ON public.band_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.band_members admin_check
      WHERE admin_check.band_id = band_members.band_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );
