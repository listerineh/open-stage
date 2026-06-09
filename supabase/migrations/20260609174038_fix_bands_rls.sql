-- Fix RLS for bands table
-- The issue is circular dependency between bands and band_members policies

-- Drop existing policies on bands
DROP POLICY IF EXISTS "Band members can view their bands" ON public.bands;
DROP POLICY IF EXISTS "Band admins can update their bands" ON public.bands;
DROP POLICY IF EXISTS "Authenticated users can create bands" ON public.bands;

-- Also fix the band_members policy that still causes recursion
DROP POLICY IF EXISTS "Users can view band members" ON public.band_members;

-- Create simple non-recursive policy for band_members
-- Only check user_id directly, no subqueries
CREATE POLICY "Users can view their band memberships"
  ON public.band_members FOR SELECT
  USING (user_id = auth.uid());

-- For viewing other members, we need a different approach
-- Create a security definer function to bypass RLS
CREATE OR REPLACE FUNCTION public.get_band_members(p_band_id uuid)
RETURNS SETOF public.band_members
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.band_members WHERE band_id = p_band_id;
$$;

-- Create simple policy for bands - users can see bands they're members of
-- Using a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.user_band_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT band_id FROM public.band_members WHERE user_id = auth.uid();
$$;

-- Now create the bands policy using the function
CREATE POLICY "Users can view their bands"
  ON public.bands FOR SELECT
  USING (id IN (SELECT public.user_band_ids()));

CREATE POLICY "Users can create bands"
  ON public.bands FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their bands"
  ON public.bands FOR UPDATE
  USING (id IN (
    SELECT band_id FROM public.band_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete their bands"
  ON public.bands FOR DELETE
  USING (id IN (
    SELECT band_id FROM public.band_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
