-- Fix: Allow users to view all members of bands they belong to
-- Currently users can only see their own membership

-- Drop existing policies to make idempotent
DROP POLICY IF EXISTS "Users can view their band memberships" ON public.band_members;
DROP POLICY IF EXISTS "Users can view members of their bands" ON public.band_members;

-- Create a new policy that allows viewing all members of bands you belong to
CREATE POLICY "Users can view members of their bands"
  ON public.band_members FOR SELECT
  USING (
    band_id IN (
      SELECT band_id FROM public.band_members WHERE user_id = auth.uid()
    )
  );
