-- Fix: UPDATE/DELETE on band_members silently fails due to RLS recursion.
-- The "Admins can update band members" policy has an EXISTS subquery on band_members,
-- which triggers the SELECT policy, which itself has a recursive band_members subquery.
-- Result: EXISTS always evaluates to false → update is silently blocked.
--
-- Fix: use SECURITY DEFINER helper functions (same pattern as user_band_ids())
-- so the admin check bypasses RLS and has no recursion.

-- 1. Helper: check if the current user is an admin of a given band (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_band_admin(p_band_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.band_members
    WHERE band_id = p_band_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Recreate the UPDATE policy using the helper (no recursive subquery)
DROP POLICY IF EXISTS "Admins can update band members" ON public.band_members;

CREATE POLICY "Admins can update band members"
  ON public.band_members FOR UPDATE
  USING (public.is_band_admin(band_id));

-- 3. Recreate the DELETE policy using the same helper for consistency
DROP POLICY IF EXISTS "Admins can delete members or self" ON public.band_members;

CREATE POLICY "Admins can delete members or self"
  ON public.band_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_band_admin(band_id)
  );

-- 4. Also fix the SELECT policy to avoid its own recursive subquery.
--    Use the existing user_band_ids() SECURITY DEFINER function.
DROP POLICY IF EXISTS "Users can view members of their bands" ON public.band_members;

CREATE POLICY "Users can view members of their bands"
  ON public.band_members FOR SELECT
  USING (
    band_id IN (SELECT public.user_band_ids())
  );
